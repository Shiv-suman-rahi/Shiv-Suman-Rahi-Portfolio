import { useMemo, useState } from 'react';

const initialPassword = 'admin123';

const cloneData = (source) => ({
  ...source,
  hero: { ...(source.hero || {}) },
  about: { ...(source.about || {}) },
  socialLinks: Array.isArray(source.socialLinks) ? source.socialLinks.map((item) => ({ ...item })) : [],
  skills: Array.isArray(source.skills) ? source.skills.map((item) => ({ ...item, items: [...(item.items || [])] })) : [],
  projects: Array.isArray(source.projects) ? source.projects.map((item) => ({
    ...item,
    technologies: [...(item.technologies || [])],
    features: [...(item.features || [])],
    detail: { ...(item.detail || {}) },
  })) : [],
  experience: Array.isArray(source.experience) ? source.experience.map((item) => ({ ...item, technologies: [...(item.technologies || [])] })) : [],
  education: Array.isArray(source.education) ? source.education.map((item) => ({ ...item })) : [],
  certifications: Array.isArray(source.certifications) ? source.certifications.map((item) => ({ ...item })) : [],
  leadership: Array.isArray(source.leadership) ? source.leadership.map((item) => ({ ...item, points: [...(item.points || [])] })) : [],
  currentLearning: Array.isArray(source.currentLearning) ? [...source.currentLearning] : [],
});

const listToText = (items = []) => items.join(', ');
const textToList = (value) => value.split(',').map((item) => item.trim()).filter(Boolean);

const tabs = ['basic', 'hero', 'about', 'social', 'skills', 'projects', 'experience', 'education', 'certifications', 'leadership'];

export function AdminPanel({ portfolio, setPortfolio, onClose }) {
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [draft, setDraft] = useState(() => cloneData(portfolio));

  const passwordHint = useMemo(
    () => `Default password: ${initialPassword}. You can change it later by setting ADMIN_PASSWORD in the .env file.`,
    []
  );

  const updateField = (key, value) => {
    setDraft((previous) => ({ ...previous, [key]: value }));
  };

  const updateNestedField = (section, key, value) => {
    setDraft((previous) => ({
      ...previous,
      [section]: {
        ...(previous[section] || {}),
        [key]: value,
      },
    }));
  };

  const updateListItem = (listKey, index, key, value) => {
    setDraft((previous) => {
      const next = [...(previous[listKey] || [])];
      next[index] = { ...(next[index] || {}), [key]: value };
      return { ...previous, [listKey]: next };
    });
  };

  const updateSkillItem = (index, key, value) => {
    setDraft((previous) => {
      const next = [...(previous.skills || [])];
      next[index] = { ...(next[index] || {}), [key]: value };
      return { ...previous, skills: next };
    });
  };

  const updateProject = (index, key, value) => {
    setDraft((previous) => {
      const next = [...(previous.projects || [])];
      next[index] = { ...(next[index] || {}), [key]: value };
      return { ...previous, projects: next };
    });
  };

  const updateProjectDetail = (projectIndex, key, value) => {
    setDraft((previous) => {
      const next = [...(previous.projects || [])];
      const project = next[projectIndex] || {};
      next[projectIndex] = {
        ...project,
        detail: {
          ...(project.detail || {}),
          [key]: value,
        },
      };
      return { ...previous, projects: next };
    });
  };

  const addProject = () => {
    setDraft((previous) => ({
      ...previous,
      projects: [
        ...(previous.projects || []),
        {
          id: `project-${Date.now()}`,
          title: 'New Project',
          category: 'Web app',
          year: '2026',
          description: 'Add a short description for your project.',
          technologies: ['React.js', 'Node.js'],
          features: ['Feature 1', 'Feature 2'],
          liveDemo: '',
          github: '',
          accent: 'cyan',
          detail: {
            overview: 'Project overview.',
            learning: 'What you learned.',
            challenges: 'Key challenge handled.',
          },
        },
      ],
    }));
  };

  const removeProject = (index) => {
    setDraft((previous) => ({
      ...previous,
      projects: (previous.projects || []).filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      setIsLoggedIn(true);
      setStatus('Logged in successfully.');
    } catch (error) {
      setStatus(error.message || 'Login failed.');
      setIsLoggedIn(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/admin/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, data: draft }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to save portfolio data.');
      }

      setPortfolio(data.data);
      setDraft(cloneData(data.data));
      setStatus('Portfolio content saved successfully.');
    } catch (error) {
      setStatus(error.message || 'Unable to save the portfolio right now.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      setStatus('Choose a PDF file before uploading.');
      return;
    }

    try {
      setIsUploadingResume(true);
      const response = await fetch('/api/admin/resume', {
        method: 'POST',
        headers: {
          'Content-Type': resumeFile.type || 'application/pdf',
          'x-admin-password': password,
        },
        body: resumeFile,
      });
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        if (response.status === 404) {
          throw new Error('Resume upload endpoint is not loaded. Restart the backend with npm run server, then try again.');
        }
        throw new Error('The backend returned an unexpected response. Check that the API server is running.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to upload the resume.');
      }

      updateField('resumeUrl', data.resumeUrl);
      setPortfolio((previous) => ({ ...previous, resumeUrl: data.resumeUrl }));
      setResumeFile(null);
      setStatus('Resume uploaded and published successfully.');
    } catch (error) {
      setStatus(error.message || 'Unable to upload the resume right now.');
    } finally {
      setIsUploadingResume(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="admin-form-grid">
            <label>
              Name
              <input value={draft.name || ''} onChange={(event) => updateField('name', event.target.value)} />
            </label>
            <label>
              Role
              <input value={draft.role || ''} onChange={(event) => updateField('role', event.target.value)} />
            </label>
            <label>
              Degree
              <input value={draft.degree || ''} onChange={(event) => updateField('degree', event.target.value)} />
            </label>
            <label>
              Institute
              <input value={draft.institute || ''} onChange={(event) => updateField('institute', event.target.value)} />
            </label>
            <label>
              University
              <input value={draft.university || ''} onChange={(event) => updateField('university', event.target.value)} />
            </label>
            <label>
              Resume URL
              <input value={draft.resumeUrl || ''} onChange={(event) => updateField('resumeUrl', event.target.value)} />
            </label>
            <label className="full-width">
              Upload resume (PDF, up to 10 MB)
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={(event) => setResumeFile(event.target.files?.[0] || null)}
              />
              <button
                type="button"
                className="button button-secondary"
                onClick={handleResumeUpload}
                disabled={!resumeFile || isUploadingResume}
              >
                {isUploadingResume ? 'Uploading...' : 'Upload resume'}
              </button>
            </label>
          </div>
        );
      case 'hero':
        return (
          <div className="admin-form-grid">
            <label>
              Hero greeting
              <input value={draft.hero?.greeting || ''} onChange={(event) => updateNestedField('hero', 'greeting', event.target.value)} />
            </label>
            <label>
              Hero title
              <input value={draft.hero?.title || ''} onChange={(event) => updateNestedField('hero', 'title', event.target.value)} />
            </label>
            <label>
              Hero subtitle
              <input value={draft.hero?.subtitle || ''} onChange={(event) => updateNestedField('hero', 'subtitle', event.target.value)} />
            </label>
            <label className="full-width">
              Intro text
              <textarea rows="4" value={draft.hero?.intro || ''} onChange={(event) => updateNestedField('hero', 'intro', event.target.value)} />
            </label>
            <label className="full-width">
              Tech stack (comma separated)
              <input value={listToText(draft.hero?.techStack || [])} onChange={(event) => updateNestedField('hero', 'techStack', textToList(event.target.value))} />
            </label>
          </div>
        );
      case 'about':
        return (
          <div className="admin-form-grid">
            <label className="full-width">
              About title
              <input value={draft.about?.title || ''} onChange={(event) => updateNestedField('about', 'title', event.target.value)} />
            </label>
            <label className="full-width">
              About description
              <textarea rows="3" value={draft.about?.description || ''} onChange={(event) => updateNestedField('about', 'description', event.target.value)} />
            </label>
            <label className="full-width">
              Paragraphs (one per line)
              <textarea rows="6" value={(draft.about?.paragraphs || []).join('\n')} onChange={(event) => updateNestedField('about', 'paragraphs', event.target.value.split('\n').map((line) => line.trim()).filter(Boolean))} />
            </label>
          </div>
        );
      case 'social':
        return (
          <div className="admin-stack">
            {(draft.socialLinks || []).map((item, index) => (
              <div key={`${item.label}-${index}`} className="admin-card-block">
                <label>
                  Label
                  <input value={item.label || ''} onChange={(event) => updateListItem('socialLinks', index, 'label', event.target.value)} />
                </label>
                <label>
                  URL
                  <input value={item.url || ''} onChange={(event) => updateListItem('socialLinks', index, 'url', event.target.value)} />
                </label>
                <label>
                  Icon
                  <input value={item.icon || ''} onChange={(event) => updateListItem('socialLinks', index, 'icon', event.target.value)} />
                </label>
              </div>
            ))}
          </div>
        );
      case 'skills':
        return (
          <div className="admin-stack">
            {(draft.skills || []).map((skill, index) => (
              <div key={`${skill.title}-${index}`} className="admin-card-block">
                <label>
                  Skill title
                  <input value={skill.title || ''} onChange={(event) => updateSkillItem(index, 'title', event.target.value)} />
                </label>
                <label>
                  Icon
                  <input value={skill.icon || ''} onChange={(event) => updateSkillItem(index, 'icon', event.target.value)} />
                </label>
                <label className="full-width">
                  Description
                  <textarea rows="3" value={skill.description || ''} onChange={(event) => updateSkillItem(index, 'description', event.target.value)} />
                </label>
                <label className="full-width">
                  Items (comma separated)
                  <input value={listToText(skill.items || [])} onChange={(event) => updateSkillItem(index, 'items', textToList(event.target.value))} />
                </label>
              </div>
            ))}
          </div>
        );
      case 'projects':
        return (
          <div className="admin-stack">
            {(draft.projects || []).map((project, index) => (
              <div key={project.id || `${project.title}-${index}`} className="admin-card-block">
                <div className="admin-card-header">
                  <h3>Project #{index + 1}</h3>
                  <button type="button" className="button button-secondary small" onClick={() => removeProject(index)}>
                    Remove
                  </button>
                </div>
                <div className="admin-form-grid">
                  <label>
                    Title
                    <input value={project.title || ''} onChange={(event) => updateProject(index, 'title', event.target.value)} />
                  </label>
                  <label>
                    Category
                    <input value={project.category || ''} onChange={(event) => updateProject(index, 'category', event.target.value)} />
                  </label>
                  <label>
                    Year
                    <input value={project.year || ''} onChange={(event) => updateProject(index, 'year', event.target.value)} />
                  </label>
                  <label>
                    Accent
                    <input value={project.accent || ''} onChange={(event) => updateProject(index, 'accent', event.target.value)} />
                  </label>
                  <label className="full-width">
                    Description
                    <textarea rows="3" value={project.description || ''} onChange={(event) => updateProject(index, 'description', event.target.value)} />
                  </label>
                  <label className="full-width">
                    Technologies (comma separated)
                    <input value={listToText(project.technologies || [])} onChange={(event) => updateProject(index, 'technologies', textToList(event.target.value))} />
                  </label>
                  <label className="full-width">
                    Features (comma separated)
                    <input value={listToText(project.features || [])} onChange={(event) => updateProject(index, 'features', textToList(event.target.value))} />
                  </label>
                  <label>
                    Live Demo URL
                    <input value={project.liveDemo || ''} onChange={(event) => updateProject(index, 'liveDemo', event.target.value)} />
                  </label>
                  <label>
                    GitHub URL
                    <input value={project.github || ''} onChange={(event) => updateProject(index, 'github', event.target.value)} />
                  </label>
                  <label className="full-width">
                    Overview
                    <textarea rows="2" value={project.detail?.overview || ''} onChange={(event) => updateProjectDetail(index, 'overview', event.target.value)} />
                  </label>
                  <label className="full-width">
                    Learning
                    <textarea rows="2" value={project.detail?.learning || ''} onChange={(event) => updateProjectDetail(index, 'learning', event.target.value)} />
                  </label>
                  <label className="full-width">
                    Challenges
                    <textarea rows="2" value={project.detail?.challenges || ''} onChange={(event) => updateProjectDetail(index, 'challenges', event.target.value)} />
                  </label>
                </div>
              </div>
            ))}
            <button type="button" className="button button-primary" onClick={addProject}>Add new project</button>
          </div>
        );
      case 'experience':
        return (
          <div className="admin-stack">
            {(draft.experience || []).map((item, index) => (
              <div key={`${item.title}-${index}`} className="admin-card-block">
                <label>
                  Title
                  <input value={item.title || ''} onChange={(event) => updateListItem('experience', index, 'title', event.target.value)} />
                </label>
                <label>
                  Company
                  <input value={item.company || ''} onChange={(event) => updateListItem('experience', index, 'company', event.target.value)} />
                </label>
                <label>
                  Period
                  <input value={item.period || ''} onChange={(event) => updateListItem('experience', index, 'period', event.target.value)} />
                </label>
                <label className="full-width">
                  Technologies (comma separated)
                  <input value={listToText(item.technologies || [])} onChange={(event) => updateListItem('experience', index, 'technologies', textToList(event.target.value))} />
                </label>
                <label className="full-width">
                  Description
                  <textarea rows="3" value={item.description || ''} onChange={(event) => updateListItem('experience', index, 'description', event.target.value)} />
                </label>
              </div>
            ))}
          </div>
        );
      case 'education':
        return (
          <div className="admin-stack">
            {(draft.education || []).map((item, index) => (
              <div key={`${item.degree}-${index}`} className="admin-card-block">
                <label>
                  Degree
                  <input value={item.degree || ''} onChange={(event) => updateListItem('education', index, 'degree', event.target.value)} />
                </label>
                <label>
                  School
                  <input value={item.school || ''} onChange={(event) => updateListItem('education', index, 'school', event.target.value)} />
                </label>
                <label>
                  University
                  <input value={item.university || ''} onChange={(event) => updateListItem('education', index, 'university', event.target.value)} />
                </label>
                <label>
                  Period
                  <input value={item.period || ''} onChange={(event) => updateListItem('education', index, 'period', event.target.value)} />
                </label>
                <label className="full-width">
                  Detail
                  <textarea rows="2" value={item.detail || ''} onChange={(event) => updateListItem('education', index, 'detail', event.target.value)} />
                </label>
              </div>
            ))}
          </div>
        );
      case 'certifications':
        return (
          <div className="admin-stack">
            {(draft.certifications || []).map((item, index) => (
              <div key={`${item.title}-${index}`} className="admin-card-block">
                <label>
                  Title
                  <input value={item.title || ''} onChange={(event) => updateListItem('certifications', index, 'title', event.target.value)} />
                </label>
                <label>
                  Issuer
                  <input value={item.issuer || ''} onChange={(event) => updateListItem('certifications', index, 'issuer', event.target.value)} />
                </label>
                <label>
                  Period
                  <input value={item.period || ''} onChange={(event) => updateListItem('certifications', index, 'period', event.target.value)} />
                </label>
                <label className="full-width">
                  Description
                  <textarea rows="3" value={item.description || ''} onChange={(event) => updateListItem('certifications', index, 'description', event.target.value)} />
                </label>
              </div>
            ))}
          </div>
        );
      case 'leadership':
        return (
          <div className="admin-stack">
            {(draft.leadership || []).map((item, index) => (
              <div key={`${item.title}-${index}`} className="admin-card-block">
                <label>
                  Title
                  <input value={item.title || ''} onChange={(event) => updateListItem('leadership', index, 'title', event.target.value)} />
                </label>
                <label>
                  Organization
                  <input value={item.organization || ''} onChange={(event) => updateListItem('leadership', index, 'organization', event.target.value)} />
                </label>
                <label className="full-width">
                  Points (one per line)
                  <textarea rows="4" value={(item.points || []).join('\n')} onChange={(event) => updateListItem('leadership', index, 'points', event.target.value.split('\n').map((line) => line.trim()).filter(Boolean))} />
                </label>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="admin-shell">
      <div className="admin-toolbar">
        <div>
          <span className="eyebrow">Admin panel</span>
          <h1>Portfolio content manager</h1>
        </div>
        <button type="button" className="button button-secondary" onClick={onClose}>
          Back to portfolio
        </button>
      </div>

      {!isLoggedIn ? (
        <form className="admin-card" onSubmit={handleLogin}>
          <label>
            Admin password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your admin password"
            />
          </label>

          <p className="admin-hint">{passwordHint}</p>

          <button className="button button-primary" type="submit">
            Login to dashboard
          </button>

          {status && <p className="form-note error">{status}</p>}
        </form>
      ) : (
        <div className="admin-card admin-editor">
          <div className="admin-tabs" aria-label="Portfolio sections">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={activeTab === tab ? 'active' : ''}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="admin-actions">
            <button type="button" className="button button-secondary" onClick={() => setDraft(cloneData(portfolio))}>
              Reload current data
            </button>
            <button type="button" className="button button-primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save portfolio data'}
            </button>
          </div>

          {renderTabContent()}

          {status && <p className={`form-note ${status.includes('success') ? 'success' : 'error'}`}>{status}</p>}
        </div>
      )}
    </div>
  );
}
