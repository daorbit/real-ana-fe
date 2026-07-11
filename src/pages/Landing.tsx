import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Puzzle, Globe, ShieldCheck, ArrowRight } from "lucide-react";
import { Wordmark, HeroMock } from "../components/Brand";

const FEATURES = [
  {
    icon: Zap,
    title: "Real-time by default",
    body: "Watch visitors land on your app live. Numbers update every few seconds — no refresh, no waiting.",
  },
  {
    icon: Puzzle,
    title: "One line to install",
    body: "Drop a single script tag into React, Vue, Angular, Svelte — anything. We handle the rest.",
  },
  {
    icon: Globe,
    title: "Know your audience",
    body: "Devices, countries, referrers, UTM campaigns and top pages — all in one clean dashboard.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy-friendly",
    body: "No cookies, no cross-site tracking. Visitor identities are hashed and rotate daily.",
  },
];

const STEPS = [
  { n: "01", t: "Create a workspace", d: "Group the apps for your team or client." },
  { n: "02", t: "Register your app", d: "Name it, pick the framework, get a site key." },
  { n: "03", t: "Paste the snippet", d: "Add one script tag before </head>." },
  { n: "04", t: "Watch it live", d: "Traffic appears in your dashboard instantly." },
];

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

export default function Landing() {
  return (
    <div className="landing">
      <div className="glow glow-a" />
      <div className="glow glow-b" />

      <nav className="lnav">
        <Wordmark />
        <div className="lnav-links">
          <Link to="/login" className="btn-text">Log in</Link>
          <Link to="/signup" className="btn-primary sm">Start free</Link>
        </div>
      </nav>

      <header className="hero">
        <motion.div className="hero-copy" initial="hidden" animate="show" variants={fade}>
          <span className="pill">✦ Real-time web analytics</span>
          <h1>
            Know exactly what's<br />
            happening in your app — <span className="grad-text">right now.</span>
          </h1>
          <p className="lead">
            Vantage gives every app you ship a live analytics dashboard. Visitors,
            pageviews, sources and devices — streaming in real time, from a single
            script tag.
          </p>
          <div className="hero-cta">
            <Link to="/signup" className="btn-primary lg">Start tracking free <ArrowRight size={18} /></Link>
            <Link to="/login" className="btn-ghost lg">Log in</Link>
          </div>
          <div className="trust">
            <span className="dot-live" /> No credit card · Works with any framework
          </div>
        </motion.div>
        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <HeroMock />
        </motion.div>
      </header>

      <section className="features">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            className="feature"
            custom={i}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={fade}
          >
            <div className="feature-icon"><f.icon size={22} /></div>
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </motion.div>
        ))}
      </section>

      <section className="steps">
        <h2>Live in under two minutes</h2>
        <div className="steps-row">
          {STEPS.map((s) => (
            <div key={s.n} className="step">
              <span className="step-n">{s.n}</span>
              <h4>{s.t}</h4>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
        <div className="code-preview">
          <div className="code-head"><span className="cd r" /><span className="cd y" /><span className="cd g" /> index.html</div>
          <pre>{`<script async
  src="https://real-ana-be.vercel.app/tracker.js"
  data-site="your-site-key">
</script>`}</pre>
        </div>
      </section>

      <section className="cta-band">
        <h2>Ship it. Then watch it grow.</h2>
        <p>Create your first dashboard in minutes.</p>
        <Link to="/signup" className="btn-primary lg">Get started free <ArrowRight size={18} /></Link>
      </section>

      <footer className="lfoot">
        <Wordmark />
        <span className="muted">© {new Date().getFullYear()} Vantage Analytics</span>
      </footer>
    </div>
  );
}
