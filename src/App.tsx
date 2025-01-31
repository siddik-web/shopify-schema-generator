import React, { useState, useEffect } from 'react';
import { Copy, Plus, Trash2, Settings, Save, FolderOpen, X, FilePlus, Download } from 'lucide-react';

type SchemaField = {
  type: string;
  id: string;
  label: string;
  default?: string | number | boolean;
  info?: string;
};

type Project = {
  id: string;
  name: string;
  fields: SchemaField[];
  lastModified: string;
};

const FIELD_TYPES = [
  'text',
  'textarea',
  'number',
  'radio',
  'select',
  'checkbox',
  'range',
  'color',
  'image_picker',
  'url',
  'richtext',
  'html',
  'video_url',
  'product',
  'collection',
  'page',
  'blog',
  'article'
];

const DEFAULT_PROJECT_NAME = 'Custom Section';

function App() {
  const [fields, setFields] = useState<SchemaField[]>([]);
  const [name, setName] = useState(DEFAULT_PROJECT_NAME);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [copiedLocales, setCopiedLocales] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const savedProjects = localStorage.getItem('shopifySchemaProjects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  const addField = () => {
    setFields([
      ...fields,
      {
        type: 'text',
        id: `field_${fields.length + 1}`,
        label: `Field ${fields.length + 1}`,
      },
    ]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, field: SchemaField) => {
    const newFields = [...fields];
    newFields[index] = field;
    setFields(newFields);
  };

  const generateSchema = () => {
    const schema = {
      name,
      settings: fields.map(field => ({
        type: field.type,
        id: field.id,
        label: `t:sections.${name.toLowerCase().replace(/\s+/g, '_')}.settings.${field.id}.label`,
        ...(field.default !== undefined && { default: field.default }),
        ...(field.info && { info: `t:sections.${name.toLowerCase().replace(/\s+/g, '_')}.settings.${field.id}.info` })
      }))
    };
    return JSON.stringify(schema, null, 2);
  };

  const generateLocales = () => {
    const locales = {
      sections: {
        [name.toLowerCase().replace(/\s+/g, '_')]: {
          name: name,
          settings: fields.reduce((acc, field) => ({
            ...acc,
            [field.id]: {
              label: field.label,
              ...(field.info && { info: field.info })
            }
          }), {})
        }
      }
    };
    return JSON.stringify(locales, null, 2);
  };

  const copyToClipboard = (text: string, setCopied: (copied: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const createNewProject = () => {
    setName(DEFAULT_PROJECT_NAME);
    setFields([]);
    setShowProjects(false);
    setSaveMessage('Started new project');
    setTimeout(() => setSaveMessage(''), 2000);
  };

  const saveProject = () => {
    const projectId = name.toLowerCase().replace(/\s+/g, '_');
    const newProject: Project = {
      id: projectId,
      name: name,
      fields: fields,
      lastModified: new Date().toISOString(),
    };

    const projectIndex = projects.findIndex(p => p.id === projectId);
    let newProjects: Project[];

    if (projectIndex >= 0) {
      newProjects = [...projects];
      newProjects[projectIndex] = newProject;
    } else {
      newProjects = [...projects, newProject];
    }

    setProjects(newProjects);
    localStorage.setItem('shopifySchemaProjects', JSON.stringify(newProjects));
    
    setSaveMessage('Project saved successfully!');
    setTimeout(() => setSaveMessage(''), 2000);
  };

  const loadProject = (project: Project) => {
    setName(project.name);
    setFields(project.fields);
    setShowProjects(false);
  };

  const deleteProject = (projectId: string) => {
    const newProjects = projects.filter(p => p.id !== projectId);
    setProjects(newProjects);
    localStorage.setItem('shopifySchemaProjects', JSON.stringify(newProjects));
  };

  const downloadJson = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-600 text-white py-6 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Shopify Schema Generator</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={createNewProject}
              className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-md hover:bg-gray-100 transition-colors"
            >
              <FilePlus className="w-4 h-4" />
              New Project
            </button>
            <button
              onClick={() => setShowProjects(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
              Open Project
            </button>
            <button
              onClick={saveProject}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Project
            </button>
          </div>
        </div>
        {saveMessage && (
          <div className="max-w-6xl mx-auto mt-2">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
              {saveMessage}
            </div>
          </div>
        )}
      </header>

      {showProjects && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">Saved Projects</h2>
              <button
                onClick={() => setShowProjects(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <button
                  onClick={createNewProject}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <FilePlus className="w-5 h-5" />
                  Create New Project
                </button>
              </div>
              {projects.length === 0 ? (
                <p className="text-gray-500 text-center">No saved projects yet.</p>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <h3 className="font-medium">{project.name}</h3>
                        <p className="text-sm text-gray-500">
                          Last modified: {new Date(project.lastModified).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadProject(project)}
                          className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deleteProject(project.id)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Fields</h2>
                <button
                  onClick={addField}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Field
                </button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={index} className="border border-gray-200 p-4 rounded-md">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-medium">Field {index + 1}</h3>
                      <button
                        onClick={() => removeField(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) =>
                            updateField(index, { ...field, type: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {FIELD_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type.replace('_', ' ').toLowerCase()}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ID
                        </label>
                        <input
                          type="text"
                          value={field.id}
                          onChange={(e) =>
                            updateField(index, { ...field, id: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Label
                        </label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) =>
                            updateField(index, { ...field, label: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Default Value
                        </label>
                        <input
                          type="text"
                          value={field.default || ''}
                          onChange={(e) =>
                            updateField(index, { ...field, default: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Info Text
                        </label>
                        <input
                          type="text"
                          value={field.info || ''}
                          onChange={(e) =>
                            updateField(index, { ...field, info: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Schema</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadJson(generateSchema(), `${name.toLowerCase().replace(/\s+/g, '_')}_schema.json`)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={() => copyToClipboard(generateSchema(), setCopiedSchema)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    {copiedSchema ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                <code>{generateSchema()}</code>
              </pre>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Locales (en.default.json)</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadJson(generateLocales(), `${name.toLowerCase().replace(/\s+/g, '_')}_locales.json`)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={() => copyToClipboard(generateLocales(), setCopiedLocales)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    {copiedLocales ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                <code>{generateLocales()}</code>
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;