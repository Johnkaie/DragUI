// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { LiveProvider, LivePreview, LiveError } from "react-live";
// import ComponentBuilder from "./ComponentBuilder";
// import "./AdminDashboard.css";

// const getComponentName = (code) => {
//   const functionMatch = code?.match(/function\s+([A-Za-z0-9_]+)/);
//   const constMatch = code?.match(/const\s+([A-Za-z0-9_]+)\s*=\s*/);
//   const arrowMatch = code?.match(/([A-Za-z0-9_]+)\s*=\s*\(.*\)\s*=>/);
//   return (functionMatch || constMatch || arrowMatch)?.[1] || "ComponentPreview";
// };

// const wrapPreviewCode = (code) => {
//   const trimmed = code?.trim();
//   if (!trimmed) return "";
//   if (trimmed.includes("render(")) return trimmed;
//   const name = getComponentName(trimmed);
//   return `${trimmed}\n\nrender(<${name} />);`;
// };

// const AdminDashboard = ({ token, onLogout }) => {
//   const [components, setComponents] = useState([]);
//   const [showBuilder, setShowBuilder] = useState(false);

//   // Fetch components on mount
//   useEffect(() => {
//     fetchComponents();
//   }, [token]);

//   const fetchComponents = async () => {
//     try {
//       const response = await axios.get(
//         "http://localhost:5000/api/admin/components",
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setComponents(response.data);
//     } catch (err) {
//       console.error("Error fetching components:", err);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this component?")) {
//       try {
//         await axios.delete(`http://localhost:5000/api/admin/component/${id}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         fetchComponents();
//       } catch (err) {
//         console.error("Error deleting component:", err);
//         alert("Error deleting component: " + (err.response?.data?.message || err.message));
//       }
//     }
//   };

//   return (
//     <div className="admin-dashboard">
//       <header className="admin-header">
//         <h1>🚀 Admin Dashboard</h1>
//         <button onClick={onLogout} className="logout-btn">
//           Logout
//         </button>
//       </header>

//       <div className="admin-content">
//         {showBuilder ? (
//           <div className="builder-full-screen">
//             <button
//               onClick={() => setShowBuilder(false)}
//               className="back-to-library-btn"
//               title="Ctrl+Escape to go back"
//             >
//               ← Back to Library
//             </button>
//             <ComponentBuilder
//               token={token}
//               onSuccess={() => {
//                 fetchComponents();
//                 setShowBuilder(false);
//               }}
//             />
//           </div>
//         ) : (
//           <div className="library-view">
//             <div className="library-header">
//               <h2>📚 Components Library</h2>
//               <button
//                 onClick={() => setShowBuilder(true)}
//                 className="create-btn"
//               >
//                 + New Component
//               </button>
//             </div>

//             {components.length === 0 ? (
//               <div className="empty-state">
//                 <div className="empty-icon">📦</div>
//                 <h3>No components yet</h3>
//                 <p>Create your first component to get started</p>
//                 <button
//                   onClick={() => setShowBuilder(true)}
//                   className="create-btn"
//                 >
//                   Create First Component
//                 </button>
//               </div>
//             ) : (
//               <div className="components-grid">
//                 {components.map((component) => (
//                   <div key={component._id} className="component-card">
//                     <div className="component-preview">
//                       {component.code ? (
//                         <LiveProvider code={wrapPreviewCode(component.code)} scope={{ React }} noInline>
//                           <div className="preview-container">
//                             <LivePreview />
//                             <LiveError className="preview-error" />
//                           </div>
//                         </LiveProvider>
//                       ) : (
//                         <div className="preview-placeholder">No preview</div>
//                       )}
//                     </div>
//                     <div className="component-info">
//                       <h3>{component.label || component.name}</h3>
//                       <div className="component-meta">
//                         <span className="meta-tag">{component.category}</span>
//                         {component.props && component.props.length > 0 && (
//                           <span className="meta-tag">{component.props.length} props</span>
//                         )}
//                       </div>
//                     </div>
//                     <button
//                       onClick={() => handleDelete(component._id)}
//                       className="delete-btn"
//                     >
//                       🗑️ Delete
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;
import React, { useState, useEffect } from "react";
import axios from "axios";
import { LiveProvider, LivePreview, LiveError } from "react-live";
import ComponentBuilder from "./ComponentBuilder";
import "./AdminDashboard.css";

const getComponentName = (code) => {
  if (!code) return "ComponentPreview";
  const functionMatch = code.match(/function\s+([A-Za-z0-9_]+)/);
  const constMatch = code.match(/const\s+([A-Za-z0-9_]+)\s*=/);
  const arrowMatch = code.match(/([A-Za-z0-9_]+)\s*=\s*\(.*?\)\s*=>/);
  return (functionMatch?.[1] || constMatch?.[1] || arrowMatch?.[1] || "ComponentPreview");
};

const wrapPreviewCode = (code) => {
  const trimmed = code?.trim();
  if (!trimmed) return "";
  if (trimmed.includes("render(")) return trimmed;
  const name = getComponentName(trimmed);
  return `${trimmed.replace(/\/\/ Asset Injection:[\s\S]*/g, "")}\n\nrender(<${name} />);`;
};

const AdminDashboard = ({ token, onLogout }) => {
  const [components, setComponents] = useState([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState("grid"); // grid | list

  useEffect(() => {
    fetchComponents();
  }, [token]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showBuilder) {
        handleCloseBuilder();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showBuilder]);

  const fetchComponents = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5000/api/admin/components",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const sorted = response.data.sort((a, b) => 
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      setComponents(sorted);
    } catch (err) {
      console.error("Error fetching components:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseBuilder = () => {
    setShowBuilder(false);
    setEditingComponent(null);
  };

  const handleEdit = (component) => {
    setEditingComponent(component);
    setShowBuilder(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this component permanently?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/component/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComponents(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      alert("Delete failed: " + (err.response?.data?.message || err.message));
      fetchComponents();
    }
  };

  // Filter & Search
  const filteredComponents = components
    .filter(comp => 
      (comp.label || comp.name || "").toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "All" || comp.category === selectedCategory)
    );

  const categories = ["All", ...new Set(components.map(c => c.category).filter(Boolean))];

  return (
    <div className="admin-dashboard glass-container">
      <header className="admin-header glass-header">
        <div className="header-left">
          <h1>🚀 Component Studio</h1>
          <p className="subtitle">Manage your UI Library</p>
        </div>
        <button onClick={onLogout} className="logout-btn glass-btn">Logout</button>
      </header>

      <div className="admin-content">
        {showBuilder ? (
          <div className="builder-full-screen">
            <button onClick={handleCloseBuilder} className="back-to-library-btn glass-btn">
              ← Back to Library
            </button>
            <ComponentBuilder
              token={token}
              initialData={editingComponent}
              onSuccess={() => {
                fetchComponents();
                handleCloseBuilder();
              }}
            />
          </div>
        ) : (
          <div className="library-view">
            <div className="library-header glass-panel">
              <div className="header-controls">
                <h2>📚 Components Library ({filteredComponents.length})</h2>
                
                <div className="search-filter-bar">
                  <input
                    type="text"
                    placeholder="Search components..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input glass-input"
                  />
                  
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="category-select glass-input"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  <div className="view-toggle">
                    <button 
                      onClick={() => setViewMode("grid")}
                      className={`toggle-btn ${viewMode === "grid" ? "active" : ""}`}
                    >
                      Grid
                    </button>
                    <button 
                      onClick={() => setViewMode("list")}
                      className={`toggle-btn ${viewMode === "list" ? "active" : ""}`}
                    >
                      List
                    </button>
                  </div>
                </div>

                <button onClick={() => setShowBuilder(true)} className="create-btn glass-btn-primary">
                  + New Component
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="loading-state glass-panel">
                <div className="loading-spinner">⏳ Loading your components...</div>
              </div>
            ) : filteredComponents.length === 0 ? (
              <div className="empty-state glass-panel">
                <div className="empty-icon">📦</div>
                <h3>No components found</h3>
                <p>Try adjusting your search or create a new one</p>
                <button onClick={() => setShowBuilder(true)} className="create-btn glass-btn-primary">
                  Create First Component
                </button>
              </div>
            ) : (
              <div className={`components-${viewMode}`}>
                {filteredComponents.map((component) => {
                  const sourceCode = component.template || component.code;

                  return (
                    <div key={component._id} className="component-card glass-card">
                      <div className="component-preview">
                        {sourceCode ? (
                          <LiveProvider code={wrapPreviewCode(sourceCode)} scope={{ React }} noInline>
                            <div className="preview-container">
                              <LivePreview />
                            </div>
                            <LiveError className="preview-error" />
                          </LiveProvider>
                        ) : (
                          <div className="preview-placeholder">No preview available</div>
                        )}
                      </div>

                      <div className="component-info">
                        <h3>{component.label || component.name}</h3>
                        <p className="component-desc">{component.description?.slice(0, 80)}...</p>
                        
                        <div className="component-meta">
                          <span className="meta-tag category">{component.category || "Uncategorized"}</span>
                          {component.props?.length > 0 && (
                            <span className="meta-tag props">{component.props.length} props</span>
                          )}
                          <span className="meta-tag date">
                            {new Date(component.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="component-actions">
                        <button onClick={() => handleEdit(component)} className="action-btn edit-btn">
                          ✏️ Edit
                        </button>
                        <button onClick={() => handleDelete(component._id)} className="action-btn delete-btn">
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;