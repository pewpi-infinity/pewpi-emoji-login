(async ()=>{
  const ADMIN = "Dianne";
  const adminName = document.getElementById("adminName");
  adminName.textContent = ADMIN;

  const msg = document.getElementById("msg");
  const pw = document.getElementById("pw");
  const btn = document.getElementById("go");

  const enc = new TextEncoder();

  const sha256 = async (s)=>{
    const buf = await crypto.subtle.digest("SHA-256", enc.encode(s));
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
  };

  const store = (k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const load = (k)=>{ try{return JSON.parse(localStorage.getItem(k));}catch(e){return null;} };

  const admin = load("pewpi_admin");

  btn.onclick = async ()=>{
    const emojis = pw.value.trim();
    if (emojis.length < 3) { msg.textContent="Too short."; msg.className="err"; return; }

    const hash = await sha256(emojis);

    // First-claim mint
    if (!admin) {
      const ip = await fetch("https://api.ipify.org?format=json").then(r=>r.json()).then(j=>j.ip).catch(()=> "unknown");
      store("pewpi_admin", {
        username: ADMIN,
        hash,
        first_ip: ip,
        created_at: new Date().toISOString()
      });
      store("pewpi_admin_logged", true);
      msg.textContent="Admin minted. Logged in.";
      msg.className="ok";
      return;
    }

    // Existing admin check
    if (admin.username !== ADMIN) {
      msg.textContent="Admin locked.";
      msg.className="err";
      return;
    }

    if (admin.hash !== hash) {
      msg.textContent="Wrong emoji password.";
      msg.className="err";
      return;
    }

    store("pewpi_admin_logged", true);
    msg.textContent="Logged in.";
    msg.className="ok";
  };
})();
