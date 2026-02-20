const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `avatar-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const DB_PATH = path.join(__dirname, 'profile.db');
let db;

function saveDb() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function run(sql, params = []) {
  db.run(sql, params);
}

function get(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

async function startServer() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }

  db.run(`CREATE TABLE IF NOT EXISTS profiles (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, title TEXT, bio TEXT, location TEXT, email TEXT, website TEXT, avatar TEXT DEFAULT '', open_to_work INTEGER DEFAULT 1, followers INTEGER DEFAULT 0, following INTEGER DEFAULT 0);`);
  db.run(`CREATE TABLE IF NOT EXISTS social_links (id INTEGER PRIMARY KEY AUTOINCREMENT, profile_id INTEGER, platform TEXT, url TEXT);`);
  db.run(`CREATE TABLE IF NOT EXISTS skills (id INTEGER PRIMARY KEY AUTOINCREMENT, profile_id INTEGER, name TEXT, endorsements INTEGER DEFAULT 0, category TEXT DEFAULT 'Technical');`);
  db.run(`CREATE TABLE IF NOT EXISTS skill_endorsements (id INTEGER PRIMARY KEY AUTOINCREMENT, skill_id INTEGER, endorser_name TEXT, created_at TEXT DEFAULT (datetime('now')));`);
  db.run(`CREATE TABLE IF NOT EXISTS work_timeline (id INTEGER PRIMARY KEY AUTOINCREMENT, profile_id INTEGER, company TEXT, role TEXT, start_date TEXT, end_date TEXT, description TEXT, current INTEGER DEFAULT 0);`);
  db.run(`CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY AUTOINCREMENT, profile_id INTEGER, title TEXT, description TEXT, tags TEXT, url TEXT);`);
  saveDb();

  const profileRow = get('SELECT COUNT(*) as c FROM profiles');
  if (!profileRow || profileRow.c === 0) {
    db.run(`INSERT INTO profiles (name,title,bio,location,email,website,open_to_work,followers,following) VALUES (?,?,?,?,?,?,?,?,?)`,
      ['Arjun Mehta','Full Stack Developer & UI/UX Enthusiast',"I build delightful web experiences with a focus on performance and accessibility. Currently exploring the intersection of AI and frontend development. When I'm not coding, you'll find me sketching UI concepts or reading about design systems.",'Chennai, India','arjun@example.com','https://arjunmehta.dev',1,1240,387]);

    const pidRow = get('SELECT last_insert_rowid() as id');
    const pid = pidRow.id;

    [['github','https://github.com/arjunmehta'],['linkedin','https://linkedin.com/in/arjunmehta'],['twitter','https://twitter.com/arjunmehta']]
      .forEach(([p,u]) => db.run('INSERT INTO social_links (profile_id,platform,url) VALUES (?,?,?)',[pid,p,u]));

    [['React',42,'Frontend'],['TypeScript',38,'Frontend'],['Node.js',35,'Backend'],['PostgreSQL',28,'Database'],['Docker',22,'DevOps'],['Figma',19,'Design'],['GraphQL',17,'Backend'],['Python',15,'Backend']]
      .forEach(([n,e,c]) => db.run('INSERT INTO skills (profile_id,name,endorsements,category) VALUES (?,?,?,?)',[pid,n,e,c]));

    [['Gidy.ai','Associate Software Developer','2024-03',null,'Building AI-powered profile features and full-stack integrations.',1],
     ['Zoho Corp','Frontend Engineer','2022-06','2024-02','Developed and maintained React-based CRM modules serving 50k+ users.',0],
     ['Freelance','Full Stack Developer','2021-01','2022-05','Built 10+ client projects ranging from e-commerce to dashboards.',0]]
      .forEach(([co,ro,s,e,d,cu]) => db.run('INSERT INTO work_timeline (profile_id,company,role,start_date,end_date,description,current) VALUES (?,?,?,?,?,?,?)',[pid,co,ro,s,e,d,cu]));

    [['AI Profile Generator','Generate professional profiles using GPT-4 and structured prompts.','React,OpenAI,Node.js','https://github.com'],
     ['DevBoard','A real-time developer dashboard with GitHub integrations.','Next.js,GraphQL,PostgreSQL','https://github.com'],
     ['SkillTracker','Track and visualize your skill growth over time.','React,D3.js,Firebase','https://github.com']]
      .forEach(([t,d,ta,u]) => db.run('INSERT INTO projects (profile_id,title,description,tags,url) VALUES (?,?,?,?,?)',[pid,t,d,ta,u]));

    saveDb();
    console.log('Database seeded!');
  }

  app.get('/api/profile/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const profile = get('SELECT * FROM profiles WHERE id=?',[id]);
    if (!profile) return res.status(404).json({error:'Not found'});
    res.json({...profile,
      social_links: all('SELECT * FROM social_links WHERE profile_id=?',[id]),
      skills: all('SELECT * FROM skills WHERE profile_id=? ORDER BY endorsements DESC',[id]),
      work_timeline: all('SELECT * FROM work_timeline WHERE profile_id=? ORDER BY start_date DESC',[id]),
      projects: all('SELECT * FROM projects WHERE profile_id=?',[id])
    });
  });

  app.put('/api/profile/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const {name,title,bio,location,email,website,open_to_work,social_links,skills,work_timeline,projects} = req.body;
    db.run('UPDATE profiles SET name=?,title=?,bio=?,location=?,email=?,website=?,open_to_work=? WHERE id=?',
      [name,title,bio,location,email,website,open_to_work?1:0,id]);
    if (social_links) {
      db.run('DELETE FROM social_links WHERE profile_id=?',[id]);
      social_links.forEach(({platform,url}) => { if(url) db.run('INSERT INTO social_links (profile_id,platform,url) VALUES (?,?,?)',[id,platform,url]); });
    }
    if (skills) {
      const existing = all('SELECT id,name FROM skills WHERE profile_id=?',[id]);
      const existingNames = existing.map(s=>s.name);
      const newNames = skills.map(s=>s.name);
      existing.filter(s=>!newNames.includes(s.name)).forEach(s => {
        db.run('DELETE FROM skill_endorsements WHERE skill_id=?',[s.id]);
        db.run('DELETE FROM skills WHERE id=?',[s.id]);
      });
      skills.filter(s=>!existingNames.includes(s.name)).forEach(({name,category}) =>
        db.run('INSERT INTO skills (profile_id,name,endorsements,category) VALUES (?,?,0,?)',[id,name,category||'Technical']));
    }
    if (work_timeline) {
      db.run('DELETE FROM work_timeline WHERE profile_id=?',[id]);
      work_timeline.forEach(({company,role,start_date,end_date,description,current}) =>
        db.run('INSERT INTO work_timeline (profile_id,company,role,start_date,end_date,description,current) VALUES (?,?,?,?,?,?,?)',
          [id,company,role,start_date,end_date||null,description,current?1:0]));
    }
    if (projects) {
      db.run('DELETE FROM projects WHERE profile_id=?',[id]);
      projects.forEach(({title,description,tags,url}) =>
        db.run('INSERT INTO projects (profile_id,title,description,tags,url) VALUES (?,?,?,?,?)',[id,title,description,tags,url]));
    }
    saveDb();
    res.json({success:true});
  });

  app.post('/api/skills/:skillId/endorse', (req, res) => {
    const id = parseInt(req.params.skillId);
    const {endorser_name} = req.body;
    if (!endorser_name) return res.status(400).json({error:'endorser_name required'});
    db.run('INSERT INTO skill_endorsements (skill_id,endorser_name) VALUES (?,?)',[id,endorser_name]);
    db.run('UPDATE skills SET endorsements=endorsements+1 WHERE id=?',[id]);
    saveDb();
    res.json(get('SELECT * FROM skills WHERE id=?',[id]));
  });

  app.post('/api/profile/:id/avatar', upload.single('avatar'), (req, res) => {
    if (!req.file) return res.status(400).json({error:'No file'});
    const avatarUrl = `/uploads/${req.file.filename}`;
    db.run('UPDATE profiles SET avatar=? WHERE id=?',[avatarUrl,parseInt(req.params.id)]);
    saveDb();
    res.json({avatar:avatarUrl});
  });

  app.post('/api/profile/:id/generate-bio', async (req, res) => {
    const {name,title,skills,location} = req.body;
    const key = process.env.ANTHROPIC_API_KEY;
    if (key) {
      try {
        const r = await fetch('https://api.anthropic.com/v1/messages', {
          method:'POST',
          headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01'},
          body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:200,
            messages:[{role:'user',content:`Write a 2-3 sentence professional bio for ${name}, a ${title} based in ${location} who specializes in ${skills}. Third person, concise, no clichés.`}]})
        });
        const d = await r.json();
        const bio = d.content?.[0]?.text?.trim();
        if (bio) return res.json({bio});
      } catch(e){ console.error(e); }
    }
    res.json({bio:`${name} is a ${title} based in ${location}, with deep expertise in ${skills}. They bring a systematic and creative approach to building software, combining technical depth with strong product instincts. Passionate about clean code and exceptional user experiences.`});
  });

  app.listen(PORT, () => console.log(`Gidy Profile API running on http://localhost:${PORT}`));
}

startServer().catch(console.error);
