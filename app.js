const { useState, useEffect, useRef } = React;

function TreeTrackerApp() {
    const [trees, setTrees] = useState([]);
    const [plots, setPlots] = useState([]);
    const [productions, setProductions] = useState([]);
    const [currentTab, setCurrentTab] = useState('trees');
    const [showForm, setShowForm] = useState(false);
    const [showPlotForm, setShowPlotForm] = useState(false);
    const [showProdForm, setShowProdForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [saveMsg, setSaveMsg] = useState('');
    const [loading, setLoading] = useState(true);
    
    const [treeForm, setTreeForm] = useState({
        name: '', species: '', plotName: '', treeNumber: '',
        size: 'medium', plantDate: '', condition: 'good', photo: '', notes: ''
    });
    
    const [plotForm, setPlotForm] = useState({name: '', photo: '', description: ''});
    const [prodForm, setProdForm] = useState({date: '', plotName: '', cartons: 0, quarters: 0, notes: ''});
    
    const fileRef = useRef(null);

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        try {
            const td = await storage.get('trees');
            const pd = await storage.get('plots');
            const prd = await storage.get('productions');
            if (td) setTrees(JSON.parse(td));
            if (pd) setPlots(JSON.parse(pd));
            if (prd) setProductions(JSON.parse(prd));
        } catch (e) {
            console.error('Load error:', e);
        } finally {
            setLoading(false);
        }
    }

    function showSave(msg) {
        setSaveMsg(msg);
        setTimeout(() => setSaveMsg(''), 3000);
    }

    async function saveTrees(data) {
        await storage.set('trees', JSON.stringify(data));
        showSave('✅ Saved!');
    }

    async function savePlots(data) {
        await storage.set('plots', JSON.stringify(data));
        showSave('✅ Saved!');
    }

    async function saveProds(data) {
        await storage.set('productions', JSON.stringify(data));
        showSave('✅ Saved!');
    }

    async function handleTreeSubmit(e) {
        e.preventDefault();
        const newTree = { id: editId || Date.now().toString(), ...treeForm };
        const updated = editId ? trees.map(t => t.id === editId ? newTree : t) : [...trees, newTree];
        setTrees(updated);
        await saveTrees(updated);
        resetTreeForm();
    }

    function resetTreeForm() {
        setTreeForm({name: '', species: '', plotName: '', treeNumber: '', size: 'medium', plantDate: '', condition: 'good', photo: '', notes: ''});
        setShowForm(false);
        setEditId(null);
    }

    function editTree(tree) {
        setTreeForm(tree);
        setEditId(tree.id);
        setShowForm(true);
    }

    async function deleteTree(id) {
        if (confirm('Delete tree?')) {
            const updated = trees.filter(t => t.id !== id);
            setTrees(updated);
            await saveTrees(updated);
        }
    }

    async function handlePhoto(e) {
        const file = e.target.files[0];
        if (file) {
            const compressed = await compressImage(file, 1);
            setTreeForm({...treeForm, photo: compressed});
            showSave('✅ Photo ready!');
        }
    }

    async function handlePlotSubmit(e) {
        e.preventDefault();
        const newPlot = { id: editId || Date.now().toString(), ...plotForm };
        const updated = editId ? plots.map(p => p.id === editId ? newPlot : p) : [...plots, newPlot];
        setPlots(updated);
        await savePlots(updated);
        setPlotForm({name: '', photo: '', description: ''});
        setShowPlotForm(false);
        setEditId(null);
    }

    async function deletePlot(id) {
        if (confirm('Delete plot?')) {
            const updated = plots.filter(p => p.id !== id);
            setPlots(updated);
            await savePlots(updated);
        }
    }

    async function handleProdSubmit(e) {
        e.preventDefault();
        const newProd = {
            id: editId || Date.now().toString(),
            ...prodForm,
            total: parseFloat(prodForm.cartons) + parseFloat(prodForm.quarters)
        };
        const updated = editId ? productions.map(p => p.id === editId ? newProd : p) : [...productions, newProd];
        setProductions(updated);
        await saveProds(updated);
        setProdForm({date: '', plotName: '', cartons: 0, quarters: 0, notes: ''});
        setShowProdForm(false);
        setEditId(null);
    }

    async function deleteProd(id) {
        if (confirm('Delete record?')) {
            const updated = productions.filter(p => p.id !== id);
            setProductions(updated);
            await saveProds(updated);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-green-50 flex items-center justify-center">
                <div className="text-2xl text-green-700">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
            {saveMsg && (
                <div style={{position: 'fixed', top: '20px', right: '20px', background: saveMsg.includes('✅') ? '#10b981' : '#ef4444', color: 'white', padding: '15px 25px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 9999}}>
                    {saveMsg}
                </div>
            )}

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">🫒</span>
                        <h1 className="text-3xl font-bold">Tree Tracker</h1>
                    </div>
                    <p className="text-gray-600 mt-2">
                        {currentTab === 'trees' && `Trees: ${trees.length}`}
                        {currentTab === 'plots' && `Plots: ${plots.length}`}
                        {currentTab === 'production' && `Records: ${productions.length}`}
                    </p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-lg p-2 mb-6 flex gap-2">
                    {['trees', 'plots', 'production'].map(tab => (
                        <button key={tab} onClick={() => setCurrentTab(tab)} className={`flex-1 px-6 py-3 rounded-lg font-semibold ${currentTab === tab ? 'bg-green-600 text-white' : 'bg-gray-100'}`}>
                            {tab === 'trees' && '🌳 Trees'}
                            {tab === 'plots' && '📍 Plots'}
                            {tab === 'production' && '📊 Production'}
                        </button>
                    ))}
                </div>

                {/* TREES TAB */}
                {currentTab === 'trees' && (
                    <>
                        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
                            <button onClick={() => setShowForm(!showForm)} className="bg-green-600 text-white px-4 py-2 rounded-lg">➕ Add Tree</button>
                        </div>

                        {showForm && (
                            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                                <h2 className="text-xl font-bold mb-4">{editId ? 'Edit' : 'Add'} Tree</h2>
                                <form onSubmit={handleTreeSubmit} className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <input required placeholder="Tree Name" value={treeForm.name} onChange={e => setTreeForm({...treeForm, name: e.target.value})} className="px-3 py-2 border rounded" />
                                        <input required placeholder="Species" value={treeForm.species} onChange={e => setTreeForm({...treeForm, species: e.target.value})} className="px-3 py-2 border rounded" />
                                        <input required placeholder="Plot Name" value={treeForm.plotName} onChange={e => setTreeForm({...treeForm, plotName: e.target.value})} className="px-3 py-2 border rounded" list="plotList" />
                                        <datalist id="plotList">{plots.map(p => <option key={p.id} value={p.name} />)}</datalist>
                                        <input required placeholder="Tree Number" value={treeForm.treeNumber} onChange={e => setTreeForm({...treeForm, treeNumber: e.target.value})} className="px-3 py-2 border rounded" />
                                        <select value={treeForm.size} onChange={e => setTreeForm({...treeForm, size: e.target.value})} className="px-3 py-2 border rounded">
                                            <option value="very-small">Very Small</option>
                                            <option value="small">Small</option>
                                            <option value="medium">Medium</option>
                                            <option value="large">Large</option>
                                        </select>
                                        <input required type="date" value={treeForm.plantDate} onChange={e => setTreeForm({...treeForm, plantDate: e.target.value})} className="px-3 py-2 border rounded" />
                                        <select value={treeForm.condition} onChange={e => setTreeForm({...treeForm, condition: e.target.value})} className="px-3 py-2 border rounded">
                                            <option value="good">Good</option>
                                            <option value="medium">Medium</option>
                                            <option value="bad">Bad</option>
                                            <option value="RIP">RIP</option>
                                        </select>
                                    </div>
                                    <div>
                                        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="px-3 py-2 border rounded w-full" />
                                        {treeForm.photo && <img src={treeForm.photo} className="mt-2 h-32 rounded object-cover" />}
                                    </div>
                                    <textarea placeholder="Notes" value={treeForm.notes} onChange={e => setTreeForm({...treeForm, notes: e.target.value})} className="w-full px-3 py-2 border rounded" rows="2" />
                                    <div className="flex gap-2">
                                        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded">Save</button>
                                        <button type="button" onClick={resetTreeForm} className="bg-gray-300 px-6 py-2 rounded">Cancel</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {trees.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                                <div className="text-6xl mb-4">🌳</div>
                                <h3 className="text-xl font-semibold text-gray-600">No trees yet</h3>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {trees.map(tree => (
                                    <div key={tree.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                                        {tree.photo && <img src={tree.photo} className="w-full h-48 object-cover" />}
                                        <div className="p-4">
                                            <div className="flex justify-between mb-2">
                                                <div>
                                                    <h3 className="font-bold">{tree.name} <span className="text-xs bg-blue-100 px-2 py-1 rounded">#{tree.treeNumber}</span></h3>
                                                    <p className="text-sm text-gray-600 italic">{tree.species}</p>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={() => editTree(tree)} className="text-blue-600">✏️</button>
                                                    <button onClick={() => deleteTree(tree.id)} className="text-red-600">🗑️</button>
                                                </div>
                                            </div>
                                            <div className="space-y-1 text-sm text-gray-600 mb-2">
                                                <div>📍 {tree.plotName}</div>
                                                <div>📅 {new Date(tree.plantDate).toLocaleDateString()}</div>
                                            </div>
                                            <div className={`inline-block px-3 py-1 rounded-full text-sm border ${getConditionColor(tree.condition)}`}>
                                                {tree.condition}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* PLOTS TAB */}
                {currentTab === 'plots' && (
                    <>
                        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
                            <button onClick={() => setShowPlotForm(!showPlotForm)} className="bg-green-600 text-white px-4 py-2 rounded-lg">➕ Add Plot</button>
                        </div>

                        {showPlotForm && (
                            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                                <h2 className="text-xl font-bold mb-4">{editId ? 'Edit' : 'Add'} Plot</h2>
                                <form onSubmit={handlePlotSubmit} className="space-y-4">
                                    <input required placeholder="Plot Name" value={plotForm.name} onChange={e => setPlotForm({...plotForm, name: e.target.value})} className="w-full px-3 py-2 border rounded" />
                                    <textarea placeholder="Description" value={plotForm.description} onChange={e => setPlotForm({...plotForm, description: e.target.value})} className="w-full px-3 py-2 border rounded" rows="3" />
                                    <div className="flex gap-2">
                                        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded">Save</button>
                                        <button type="button" onClick={() => {setShowPlotForm(false); setEditId(null);}} className="bg-gray-300 px-6 py-2 rounded">Cancel</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {plots.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                                <div className="text-6xl mb-4">📍</div>
                                <h3 className="text-xl font-semibold text-gray-600">No plots yet</h3>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {plots.map(plot => (
                                    <div key={plot.id} className="bg-white rounded-lg shadow-lg p-4">
                                        <div className="flex justify-between mb-2">
                                            <div>
                                                <h3 className="text-xl font-bold">{plot.name}</h3>
                                                <p className="text-sm text-gray-600">🌳 {trees.filter(t => t.plotName === plot.name).length} trees</p>
                                            </div>
                                            <button onClick={() => deletePlot(plot.id)} className="text-red-600">🗑️</button>
                                        </div>
                                        {plot.description && <p className="text-sm text-gray-600">{plot.description}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* PRODUCTION TAB */}
                {currentTab === 'production' && (
                    <>
                        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
                            <button onClick={() => setShowProdForm(!showProdForm)} className="bg-green-600 text-white px-4 py-2 rounded-lg">➕ Add Production</button>
                        </div>

                        {showProdForm && (
                            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                                <h2 className="text-xl font-bold mb-4">{editId ? 'Edit' : 'Add'} Production</h2>
                                <form onSubmit={handleProdSubmit} className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <input required type="date" value={prodForm.date} onChange={e => setProdForm({...prodForm, date: e.target.value})} className="px-3 py-2 border rounded" />
                                        <input required placeholder="Plot Name" value={prodForm.plotName} onChange={e => setProdForm({...prodForm, plotName: e.target.value})} className="px-3 py-2 border rounded" list="plotListProd" />
                                        <datalist id="plotListProd">{plots.map(p => <option key={p.id} value={p.name} />)}</datalist>
                                        <input required type="number" min="0" step="1" placeholder="Cartons (integer)" value={prodForm.cartons} onChange={e => setProdForm({...prodForm, cartons: parseInt(e.target.value) || 0})} className="px-3 py-2 border rounded" />
                                        <select value={prodForm.quarters} onChange={e => setProdForm({...prodForm, quarters: parseFloat(e.target.value)})} className="px-3 py-2 border rounded">
                                            <option value="0">0.00</option>
                                            <option value="0.25">0.25</option>
                                            <option value="0.50">0.50</option>
                                            <option value="0.75">0.75</option>
                                        </select>
                                    </div>
                                    <textarea placeholder="Notes" value={prodForm.notes} onChange={e => setProdForm({...prodForm, notes: e.target.value})} className="w-full px-3 py-2 border rounded" rows="2" />
                                    <div className="bg-blue-50 p-3 rounded">
                                        <strong>Total:</strong> {parseFloat(prodForm.cartons) + parseFloat(prodForm.quarters)} cartons
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded">Save</button>
                                        <button type="button" onClick={() => {setShowProdForm(false); setEditId(null);}} className="bg-gray-300 px-6 py-2 rounded">Cancel</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {productions.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                                <div className="text-6xl mb-4">📊</div>
                                <h3 className="text-xl font-semibold text-gray-600">No production records</h3>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-green-600 text-white">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Date</th>
                                            <th className="px-4 py-3 text-left">Plot</th>
                                            <th className="px-4 py-3 text-left">Cartons</th>
                                            <th className="px-4 py-3 text-left">Quarters</th>
                                            <th className="px-4 py-3 text-left">Total</th>
                                            <th className="px-4 py-3 text-left">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productions.map((p, i) => (
                                            <tr key={p.id} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                                <td className="px-4 py-3">{new Date(p.date).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 font-semibold">{p.plotName}</td>
                                                <td className="px-4 py-3">{p.cartons}</td>
                                                <td className="px-4 py-3">{p.quarters}</td>
                                                <td className="px-4 py-3 font-bold text-green-600">{p.total}</td>
                                                <td className="px-4 py-3">
                                                    <button onClick={() => deleteProd(p.id)} className="text-red-600">🗑️</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

ReactDOM.render(<TreeTrackerApp />, document.getElementById('root'));
