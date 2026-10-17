import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiBriefcase,
  FiCheckCircle,
  FiChevronDown,
  FiCode,
  FiDownload,
  FiExternalLink,
  FiGithub,
  FiLinkedin,
  FiMail,
  FiMenu,
  FiMoon,
  FiSend,
  FiSun,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import { SiLeetcode } from 'react-icons/si';
import { apiUrl, parseApiResponse, resolveApiUrl } from './api';
import { portfolioData as defaultPortfolioData } from './data/portfolioData';
import { AdminPanel } from './components/AdminPanel';
import './App.css';

const normalizePortfolio = (data = defaultPortfolioData) => ({
  ...defaultPortfolioData,
  ...data,
  hero: { ...defaultPortfolioData.hero, ...(data?.hero || {}) },
  about: { ...defaultPortfolioData.about, ...(data?.about || {}) },
  socialLinks: Array.isArray(data?.socialLinks) ? data.socialLinks : defaultPortfolioData.socialLinks,
  skills: Array.isArray(data?.skills) ? data.skills : defaultPortfolioData.skills,
  projects: Array.isArray(data?.projects) ? data.projects : defaultPortfolioData.projects,
  experience: Array.isArray(data?.experience) ? data.experience : defaultPortfolioData.experience,
  education: Array.isArray(data?.education) ? data.education : defaultPortfolioData.education,
  certifications: Array.isArray(data?.certifications) ? data.certifications : defaultPortfolioData.certifications,
  leadership: Array.isArray(data?.leadership) ? data.leadership : defaultPortfolioData.leadership,
});

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'contact', label: 'Contact' },
];

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="section-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

function Navbar({ activeSection, darkMode, onToggleTheme, onOpenAdmin, portfolio }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-nav">
      <a className="brand" href="#home" onClick={closeMenu} aria-label="Shiv Suman Rahi home">
        <span className="brand-mark">S</span>
        <span>{portfolio.name}</span>
      </a>

      <button
        className="mobile-menu-button"
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        aria-expanded={menuOpen}
        aria-controls="main-navigation"
        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
      >
        {menuOpen ? <FiX /> : <FiMenu />}
      </button>

      <nav id="main-navigation" className={`main-navigation ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
        {navItems.map((item) => (
          <a key={item.id} href={`#${item.id}`} className={activeSection === item.id ? 'active' : ''} onClick={closeMenu}>
            {item.label}
          </a>
        ))}

        <button className="theme-toggle" type="button" onClick={onToggleTheme} aria-label="Toggle color theme">
          {darkMode ? <FiSun /> : <FiMoon />}
        </button>

        <a className="nav-cta" href={resolveApiUrl(portfolio.resumeUrl) || '#resume'} onClick={closeMenu}>
          Download Resume <FiArrowRight />
        </a>

        <button type="button" className="nav-admin-button" onClick={() => { closeMenu(); onOpenAdmin(); }}>
          Admin
        </button>
      </nav>
    </header>
  );
}

function Hero({ portfolio }) {
  const prefersReducedMotion = useReducedMotion();
  const { hero } = portfolio;

  return (
    <section id="home" className="section-shell hero-section">
      <div className="hero-grid">
        <motion.div
          className="hero-copy"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="availability-badge">
            <span /> Open to opportunities
          </div>

          <p className="hero-greeting">{hero.greeting}</p>

          <h1>
            <span className="hero-highlight">{hero.title}</span>
            <small>{hero.subtitle}</small>
          </h1>

          <p className="hero-intro">{hero.intro}</p>

          <div className="hero-actions">
            <a className="button button-primary" href="#projects">
              View My Projects <FiArrowRight />
            </a>
            <a className="button button-secondary" href={resolveApiUrl(portfolio.resumeUrl) || '#resume'}>
              <FiDownload /> Download Resume
            </a>
          </div>

          <div className="social-row" aria-label="Social media profiles">
            {portfolio.socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.url || '#contact'}
                target={link.url.startsWith('http') ? '_blank' : undefined}
                rel={link.url.startsWith('http') ? 'noreferrer' : undefined}
                className="social-link"
                aria-label={link.label}
              >
                {link.icon === 'github' && <FiGithub />}
                {link.icon === 'linkedin' && <FiLinkedin />}
                {link.icon === 'leetcode' && <SiLeetcode />}
              </a>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="hero-visual"
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <div className="code-card">
            <div className="code-card-header">
              <span />
              <span />
              <span />
              <small>developer.js</small>
            </div>
            <pre>
              <code>
                <span className="code-purple">const</span> <span className="code-blue">developer</span> = {'{'}
                {'\n  '}name: <span className="code-green">"Shiv Suman Rahi"</span>,
                {'\n  '}role: <span className="code-green">"MERN Stack Developer"</span>,
                {'\n  '}focus: [<span className="code-green">"Web Apps"</span>, <span className="code-green">"Backend"</span>],
                {'\n  '}build: <span className="code-purple">() =&gt;</span> <span className="code-green">"ship useful products"</span>
                {'\n'}{'}'}
              </code>
            </pre>
          </div>

          <div className="floating-note note-one">
            <FiCode /> Clean ideas, carefully built.
          </div>
          <div className="floating-note note-two">
            <FiBookOpen /> CS Data Science learner
          </div>
        </motion.div>
      </div>

      <div className="tech-stack" aria-label="Technology stack">
        {hero.techStack.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>

      <a className="scroll-cue" href="#about">
        <span /> Scroll to explore <FiChevronDown />
      </a>
    </section>
  );
}

function About({ portfolio }) {
  const { about } = portfolio;

  return (
    <section id="about" className="section-shell">
      <SectionHeading eyebrow="01 / About me" title={about.title} description={about.description} />

      <div className="about-grid">
        <div className="story-card">
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="details-card">
          <div className="card-label">Profile details</div>
          {about.details.map((detail) => (
            <div className="detail-row" key={detail.label}>
              <span>{detail.label}</span>
              <strong>{detail.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Skills({ portfolio }) {
  const { skills, currentLearning } = portfolio;

  return (
    <section id="skills" className="section-shell section-alt">
      <SectionHeading
        eyebrow="02 / Technical skills"
        title="A practical toolkit for modern development."
        description="I focus on technologies that help me build reliable interfaces, structured APIs, and full-stack applications with a strong foundation in problem solving."
      />

      <div className="skill-grid">
        {skills.map((group) => (
          <article className="skill-card" key={group.title}>
            <div className="skill-icon">
              {group.icon === 'code' && <FiCode />}
              {group.icon === 'frontend' && <FiCode />}
              {group.icon === 'backend' && <FiBriefcase />}
              {group.icon === 'database' && <FiBookOpen />}
              {group.icon === 'tools' && <FiUsers />}
              {group.icon === 'learning' && <FiAward />}
            </div>
            <h3>{group.title}</h3>
            <p>{group.description}</p>
            <div className="chip-list">
              {group.items.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="learning-block">
        <div className="card-label">Currently Learning</div>
        <div className="chip-list">
          {currentLearning.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectModal({ project, onClose }) {
  if (!project) return null;

  return (
    <div className="project-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label={`${project.title} project details`}>
      <div className="project-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close project details">
          <FiX />
        </button>

        <div className="project-modal-header">
          <span>{project.category}</span>
          <h3>{project.title}</h3>
        </div>

        <div className="project-modal-body">
          <section>
            <h4>Overview</h4>
            <p>{project.detail.overview}</p>
          </section>

          <section>
            <h4>Technologies</h4>
            <div className="chip-list">
              {project.technologies.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </section>

          <section>
            <h4>Features</h4>
            <ul>
              {project.features.map((feature) => (
                <li key={feature}><FiCheckCircle /> {feature}</li>
              ))}
            </ul>
          </section>

          <section>
            <h4>What I Learned</h4>
            <p>{project.detail.learning}</p>
          </section>

          <section>
            <h4>Challenges</h4>
            <p>{project.detail.challenges}</p>
          </section>

          <section>
            <h4>Links</h4>
            <div className="modal-links">
              <a href={project.liveDemo || '#'} target={project.liveDemo ? '_blank' : undefined} rel={project.liveDemo ? 'noreferrer' : undefined}>
                Live Demo <FiExternalLink />
              </a>
              <a href={project.github || '#'} target={project.github ? '_blank' : undefined} rel={project.github ? 'noreferrer' : undefined}>
                GitHub <FiExternalLink />
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Projects({ portfolio }) {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <section id="projects" className="section-shell section-alt">
      <SectionHeading
        eyebrow="03 / Projects"
        title="Project work that shows practical development skills."
        description="Each project demonstrates a focused approach to product thinking, implementation, and clean front-end interaction design."
      />

      <div className="project-grid">
        {portfolio.projects.map((project) => (
          <article key={project.id} className="project-card">
            <div className={`project-visual project-${project.accent}`}>
              <span>{project.category}</span>
            </div>

            <div className="project-body">
              <div className="project-meta">
                <span>{project.year}</span>
                <span>{project.category}</span>
              </div>

              <h3>{project.title}</h3>
              <p>{project.description}</p>

              <div className="chip-list">
                {project.technologies.map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>

              <ul className="project-feature-list">
                {project.features.slice(0, 3).map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <div className="project-actions">
                <a href={project.liveDemo || '#'} target={project.liveDemo ? '_blank' : undefined} rel={project.liveDemo ? 'noreferrer' : undefined}>
                  Live Demo <FiExternalLink />
                </a>
                <a href={project.github || '#'} target={project.github ? '_blank' : undefined} rel={project.github ? 'noreferrer' : undefined}>
                  GitHub <FiExternalLink />
                </a>
                <button type="button" onClick={() => setSelectedProject(project)}>
                  Case study
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </section>
  );
}

function Experience({ portfolio }) {
  return (
    <section id="experience" className="section-shell">
      <SectionHeading
        eyebrow="04 / Training & experience"
        title="Building skills through projects, training, and practical web work."
        description="The timeline below highlights my learning path and the technical foundations I am strengthening as I prepare for full-stack development opportunities."
      />

      <div className="timeline">
        {portfolio.experience.map((item) => (
          <article className="timeline-item" key={`${item.title}-${item.period}`}>
            <div className="timeline-dot" />
            <div className="timeline-content">
              <span className="timeline-period">{item.period}</span>
              <h3>{item.title}</h3>
              <p className="timeline-company">{item.company}</p>
              <div className="chip-list">
                {item.technologies.map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>
              <p className="timeline-description">{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Education({ portfolio }) {
  return (
    <section id="education" className="section-shell section-alt">
      <SectionHeading eyebrow="05 / Education" title="Academic foundation with a focus on technology and problem solving." description="My coursework and learning path are centered on software engineering, data structures, databases, and modern computing concepts." />

      <div className="timeline timeline-compact">
        {portfolio.education.map((item) => (
          <article className="timeline-item" key={`${item.degree}-${item.period}`}>
            <div className="timeline-dot" />
            <div className="timeline-content">
              <span className="timeline-period">{item.period}</span>
              <h3>{item.degree}</h3>
              <p className="timeline-company">{item.school}</p>
              <p className="timeline-university">{item.university}</p>
              <p className="timeline-detail">{item.detail}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Certifications({ portfolio }) {
  return (
    <section id="certifications" className="section-shell">
      <SectionHeading eyebrow="06 / Certifications & achievements" title="Recognitions that reflect discipline and leadership." description="These credentials and experiences reflect my commitment to structured learning, teamwork, and service." />

      <div className="cert-grid">
        {portfolio.certifications.map((item) => (
          <article className="cert-card" key={item.title}>
            <div className="card-label">Certification</div>
            <h3>{item.title}</h3>
            <p>{item.issuer}</p>
            <span>{item.period}</span>
            <small>{item.description}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

function Leadership({ portfolio }) {
  return (
    <section id="leadership" className="section-shell section-alt">
      <SectionHeading eyebrow="07 / Leadership & responsibilities" title="Leadership grounded in coordination, teamwork, and execution." description="I value responsibility, team coordination, and creating a positive, organized environment for learning and events." />

      <div className="leadership-grid">
        {portfolio.leadership.map((item) => (
          <article className="leadership-card" key={item.title}>
            <div className="card-label">Leadership role</div>
            <h3>{item.title}</h3>
            <p className="leadership-org">{item.organization}</p>
            <ul>
              {item.points.map((point) => (
                <li key={point}><FiCheckCircle /> {point}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function ResumeSection({ portfolio }) {
  return (
    <section id="resume" className="section-shell resume-section">
      <div className="resume-card">
        <div>
          <span className="eyebrow">Resume</span>
          <h2>Want to know more about my experience?</h2>
        </div>
        <p>
          View or download my complete resume for a detailed overview of my education, skills, projects, training and experience.
        </p>
        <a className="button button-primary" href={resolveApiUrl(portfolio.resumeUrl) || '#contact'}>
          <FiDownload /> Download Resume
        </a>
      </div>
    </section>
  );
}

function Contact({ portfolio }) {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const text = String(formData.get('message') || '').trim();

    if (!name || !email || !text) {
      setStatus('error');
      setMessage('Please complete all fields before sending your message.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setMessage('Sending your message...');

    try {
      const response = await fetch(apiUrl('/api/contact'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message: text }),
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Unable to send your message right now.');
      }

      setStatus('success');
      setMessage(data.message || 'Thank you! Your message has been sent successfully.');
      form.reset();
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Something went wrong while sending your message.');
    }
  };

  return (
    <section id="contact" className="section-shell">
      <SectionHeading
        eyebrow="08 / Contact"
        title="Let's Build Something Together"
        description="Open to opportunities, collaborations, and software projects that help build useful digital products."
      />

      <div className="contact-layout">
        <div className="contact-card">
          <div className="contact-links">
            <a href={portfolio.socialLinks[0]?.url || '#contact'} target="_blank" rel="noreferrer">
              <FiGithub /> GitHub
            </a>
            <a href={portfolio.socialLinks[1]?.url || '#contact'}>
              <FiLinkedin /> LinkedIn
            </a>
            <a href={portfolio.socialLinks[2]?.url || '#contact'}>
              <SiLeetcode /> LeetCode
            </a>
            <a href={resolveApiUrl(portfolio.resumeUrl) || '#resume'}>
              <FiMail /> Email
            </a>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          <label>
            Name
            <input type="text" name="name" placeholder="Your name" required />
          </label>

          <label>
            Email
            <input type="email" name="email" placeholder="you@example.com" required />
          </label>

          <label>
            Message
            <textarea name="message" rows="5" placeholder="Tell me about your project or opportunity" required />
          </label>

          <button className="button button-primary" type="submit">
            <FiSend /> Send Message
          </button>

          {message && (
            <p className={`form-note ${status === 'error' ? 'error' : 'success'}`} role={status === 'error' ? 'alert' : 'status'}>
              {message}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}

function Footer({ portfolio }) {
  return (
    <footer className="site-footer">
      <div className="footer-brand">{portfolio.name}</div>
      <div className="footer-role">{portfolio.role}</div>
      <div className="footer-links">
        <a href={portfolio.socialLinks[0]?.url || '#contact'} target="_blank" rel="noreferrer">GitHub</a>
        <a href={portfolio.socialLinks[1]?.url || '#contact'}>LinkedIn</a>
        <a href={portfolio.socialLinks[2]?.url || '#contact'}>LeetCode</a>
        <a href={resolveApiUrl(portfolio.resumeUrl) || '#resume'}>Email</a>
      </div>
      <p>© 2026 {portfolio.name}. All rights reserved.</p>
    </footer>
  );
}

function App() {
  const [portfolio, setPortfolio] = useState(() => normalizePortfolio(defaultPortfolioData));
  const [activeSection, setActiveSection] = useState('home');
  const [darkMode, setDarkMode] = useState(true);
  const [showAdmin, setShowAdmin] = useState(() => new URLSearchParams(window.location.search).get('admin') === 'true');

  useEffect(() => {
    const controller = new AbortController();

    fetch(apiUrl('/api/admin/portfolio'), { signal: controller.signal })
      .then((response) => response.ok ? parseApiResponse(response) : Promise.reject(new Error('Unable to load content')))
      .then((data) => {
        if (data?.data) {
          setPortfolio(normalizePortfolio(data.data));
        }
      })
      .catch(() => {
        setPortfolio(normalizePortfolio(defaultPortfolioData));
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const sectionNodes = navItems.map((item) => document.getElementById(item.id)).filter(Boolean);

    if (!sectionNodes.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry) setActiveSection(visibleEntry.target.id);
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );

    sectionNodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = height > 0 ? (scrollTop / height) * 100 : 0;
      document.documentElement.style.setProperty('--scroll-progress', `${Math.min(progress, 100)}%`);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (showAdmin) {
    return <AdminPanel portfolio={portfolio} setPortfolio={setPortfolio} onClose={() => setShowAdmin(false)} />;
  }

  return (
    <div className="app-shell">
      <div className="scroll-progress" aria-hidden="true" />
      <Navbar
        activeSection={activeSection}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((value) => !value)}
        onOpenAdmin={() => setShowAdmin(true)}
        portfolio={portfolio}
      />
      <main>
        <Hero portfolio={portfolio} />
        <About portfolio={portfolio} />
        <Skills portfolio={portfolio} />
        <Projects portfolio={portfolio} />
        <Experience portfolio={portfolio} />
        <Education portfolio={portfolio} />
        <Certifications portfolio={portfolio} />
        <Leadership portfolio={portfolio} />
        <ResumeSection portfolio={portfolio} />
        <Contact portfolio={portfolio} />
      </main>
      <Footer portfolio={portfolio} />
    </div>
  );
}

export default App;
