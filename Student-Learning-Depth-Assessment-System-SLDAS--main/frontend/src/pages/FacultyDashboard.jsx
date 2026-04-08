import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  PlusCircle, 
  Save, 
  Trash2, 
  FileText, 
  Users, 
  AlertCircle, 
  ChevronRight, 
  Clock, 
  Edit3, 
  Eye, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BarChart3
} from 'lucide-react';
import { Button, Card, Badge, Table, TableRow, Input, Loader } from '../components/UI';

const FacultyDashboard = ({ user }) => {
  const [tests, setTests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Test form states
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [editingTestId, setEditingTestId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  
  // Results viewing states
  const [isViewingResults, setIsViewingResults] = useState(false);
  const [selectedTestResults, setSelectedTestResults] = useState([]);
  const [selectedTestTitle, setSelectedTestTitle] = useState('');
  
  useEffect(() => {
    fetchTests();
  }, [user.token]);

  const fetchTests = async () => {
    try {
      const { data } = await axios.get('http://127.0.0.1:5000/api/tests', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setTests(data);
    } catch (err) {
      console.error(err);
    }
  };
  
  useEffect(() => {
    if (isCreating) {
      fetchStudents();
    }
  }, [isCreating, user.token]);

  const fetchStudents = async () => {
    try {
      const { data } = await axios.get('http://127.0.0.1:5000/api/auth/students', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setStudents(data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStudentSelection = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const addQuestion = (type) => {
    setQuestions([
      ...questions,
      {
        id: Date.now(),
        type,
        question: '',
        marks: 5,
        options: type === 'MCQ' ? ['', '', '', ''] : [],
        correctAnswer: '',
        modelAnswer: ''
      }
    ]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  const calculateTotalMarks = () => {
    return questions.reduce((sum, q) => sum + Number(q.marks || 0), 0);
  };

  const handleCreateTest = async () => {
    setIsLoading(true);
    try {
      const cleanedQuestions = questions.map(q => {
        const { id, ...rest } = q;
        return rest;
      });

      if (editingTestId) {
        await axios.put(`http://127.0.0.1:5000/api/tests/${editingTestId}`, {
          title,
          duration: Number(duration),
          totalMarks: calculateTotalMarks(),
          questions: cleanedQuestions,
          assignedStudents: selectedStudents
        }, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      } else {
        await axios.post('http://127.0.0.1:5000/api/tests', {
          title,
          duration: Number(duration),
          totalMarks: calculateTotalMarks(),
          questions: cleanedQuestions,
          assignedStudents: selectedStudents
        }, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      }
      
      setIsCreating(false);
      setEditingTestId(null);
      setTitle('');
      setDuration('');
      setQuestions([]);
      setSelectedStudents([]);
      fetchTests();
    } catch (err) {
      console.error(err);
      alert('Error saving assessment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = async (test) => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`http://127.0.0.1:5000/api/tests/${test._id}/full`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setTitle(data.test.title);
      setDuration(data.test.duration);
      setQuestions(data.questions.map(q => ({ ...q, id: q._id })));
      setSelectedStudents(data.test.assignedStudents || []);
      setEditingTestId(test._id);
      setIsCreating(true);
    } catch (err) {
      console.error(err);
      alert('Error loading test for edit');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTest = async (testId) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) return;
    try {
      await axios.delete(`http://127.0.0.1:5000/api/tests/${testId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchTests();
    } catch (err) {
      console.error(err);
      alert('Error deleting test');
    }
  };

  const fetchTestResults = async (test) => {
    setIsLoading(true);
    setSelectedTestTitle(test.title);
    try {
      const { data } = await axios.get(`http://127.0.0.1:5000/api/results/test/${test._id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSelectedTestResults(data);
      setIsViewingResults(true);
    } catch (err) {
      console.error(err);
      alert('Error fetching results');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {!isCreating && !isViewingResults ? (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Faculty Console</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your assessments and track student performance.</p>
            </div>
            <Button onClick={() => setIsCreating(true)} icon={PlusCircle} className="shadow-blue-200">
              Create New Assessment
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map(test => (
              <Card key={test._id} className="relative group overflow-hidden flex flex-col h-full !p-0 border-none shadow-md hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => handleEditClick(test)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteTest(test._id)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight uppercase tracking-tight">{test.title}</h3>
                  
                  <div className="flex flex-wrap gap-3 mt-4">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/50 px-2 py-1 rounded-md">
                      <Clock className="w-3 h-3" /> {test.duration} MINS
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/50 px-2 py-1 rounded-md">
                      <BarChart3 className="w-3 h-3" /> {test.totalMarks} PTS
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-950/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                  <Button 
                    variant="secondary" 
                    className="w-full justify-between"
                    onClick={() => fetchTestResults(test)}
                  >
                    <span>View Submissions</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
            
            {tests.length === 0 && (
              <Card className="col-span-full border-dashed border-2 py-16 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950/20 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">No assessments found</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-2">Create your first assessment to start evaluating student performance with AI-powered insights.</p>
                <Button onClick={() => setIsCreating(true)} className="mt-6" icon={PlusCircle}>Get Started</Button>
              </Card>
            )}
          </div>
        </>
      ) : isViewingResults ? (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <Card className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-800 border-l-4 border-l-blue-600">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="info">Assessment Report</Badge>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{selectedTestResults.length} Submissions</span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{selectedTestTitle}</h2>
            </div>
            <Button variant="secondary" onClick={() => setIsViewingResults(false)}>
              Back to Overview
            </Button>
          </Card>

          <Card className="!p-0 overflow-hidden">
            <Table headers={['Student Information', 'Score', 'Status / Evaluation', 'Date Submitted', '']}>
              {selectedTestResults.map(res => (
                <TableRow key={res._id}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                      {res.studentId?.name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{res.studentId?.name || 'Deleted User'}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{res.studentId?.email}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-xl font-black text-blue-600 dark:text-blue-400">{res.score}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 ml-1 font-bold">/ 100</span>
                  </div>
                  <div>
                    {res.isMalpractice ? (
                      <Badge variant="danger" className="flex items-center gap-1 w-fit">
                        <XCircle className="w-3 h-3" /> Malpractice
                      </Badge>
                    ) : (
                      <Badge 
                        variant={res.scoreLevel === 'Expert' ? 'success' : res.scoreLevel === 'Proficient' ? 'info' : 'warning'}
                        className="flex items-center gap-1 w-fit"
                      >
                        <CheckCircle2 className="w-3 h-3" /> {res.scoreLevel}
                      </Badge>
                    )}
                  </div>
                  <span className="text-slate-500 font-medium whitespace-nowrap">
                    {new Date(res.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <div className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600 font-bold"
                      onClick={() => navigate(`/results/${res.testId}/${res._id}`)}
                    >
                      Analytics <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                </TableRow>
              ))}
              {selectedTestResults.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <Users className="w-12 h-12 text-slate-200 mb-2" />
                      <p className="text-slate-500 font-medium">Waiting for submissions...</p>
                    </div>
                  </td>
                </tr>
              )}
            </Table>
          </Card>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-8 duration-500">
          <div className="flex items-center justify-between bg-white dark:bg-slate-800 px-8 py-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50 sticky top-20 z-20 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Edit3 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingTestId ? 'Edit Assessment' : 'New Assessment'}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest">{questions.length} Questions Drafted</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => {setIsCreating(false); setEditingTestId(null); setTitle(''); setQuestions([]);}}>Cancel</Button>
              <Button onClick={handleCreateTest} disabled={isLoading || questions.length === 0} icon={Save}>
                {isLoading ? 'Saving...' : 'Publish'}
              </Button>
            </div>
          </div>

          <Card className="space-y-6 shadow-xl shadow-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Assessment Title" placeholder="e.g. Advanced Quantum Mechanics" value={title} onChange={e => setTitle(e.target.value)} />
              <Input label="Duration (Minutes)" type="number" placeholder="60" value={duration} onChange={e => setDuration(e.target.value)} />
            </div>

            <div className="p-6 bg-slate-50/50 dark:bg-slate-950/50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Target Students
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {students.map(s => (
                  <label key={s._id} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${selectedStudents.includes(s._id) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-sm' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-600'}`}>
                    <input 
                      type="checkbox" 
                      checked={selectedStudents.includes(s._id)} 
                      onChange={() => toggleStudentSelection(s._id)}
                      className="w-4 h-4 text-blue-600 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500"
                    />
                    <div className="truncate">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{s.name}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate uppercase">{s.email}</p>
                    </div>
                  </label>
                ))}
              </div>
              {selectedStudents.length === 0 && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-semibold">
                  <AlertCircle className="w-4 h-4" /> Note: This assessment will be visible to all students if no specific students are selected.
                </div>
              )}
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Question Bank</h4>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => addQuestion('MCQ')} icon={PlusCircle}>Add MCQ</Button>
                  <Button variant="secondary" size="sm" onClick={() => addQuestion('Descriptive')} icon={PlusCircle} className="!text-indigo-600 dark:!text-indigo-400 !border-indigo-100 dark:!border-indigo-800 !bg-indigo-50 dark:!bg-indigo-900/30">Add AI Descriptive</Button>
                </div>
              </div>

              <div className="space-y-6">
                {questions.map((q, index) => (
                  <div key={q.id} className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden group shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-600">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-200 dark:group-hover:bg-blue-500 transition-colors"></div>
                    <div className="p-6 pl-8">
                       <button onClick={() => removeQuestion(index)} className="absolute top-4 right-4 p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-5 h-5" />
                      </button>

                      <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1 block">Question {index + 1} ({q.type})</label>
                          <input type="text" className="w-full text-lg font-bold text-slate-900 dark:text-white bg-transparent border-none px-0 focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-600" placeholder="Type your question here..." value={q.question} onChange={e => updateQuestion(index, 'question', e.target.value)} />
                        </div>
                        <div className="w-full md:w-24">
                          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1 block">Points</label>
                          <input type="number" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/20 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={q.marks} onChange={e => updateQuestion(index, 'marks', e.target.value)} />
                        </div>
                      </div>

                      {q.type === 'MCQ' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/20 dark:bg-slate-900 rounded-xl border border-transparent focus-within:border-blue-200 dark:focus-within:border-blue-800 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all">
                              <input 
                                type="radio" 
                                name={`correct-${q.id}`} 
                                checked={q.correctAnswer === opt && opt !== ''} 
                                onChange={() => updateQuestion(index, 'correctAnswer', opt)} 
                                className="w-5 h-5 text-blue-600 border-slate-300 dark:border-slate-700 focus:ring-blue-500 dark:bg-slate-800" 
                              />
                              <input 
                                type="text" 
                                className="flex-1 bg-transparent border-none p-0 text-sm font-medium text-slate-900 dark:text-white focus:ring-0 placeholder:text-slate-400 dark:placeholder:text-slate-600" 
                                placeholder={`Option ${oIdx + 1}`} 
                                value={opt} 
                                onChange={(e) => updateOption(index, oIdx, e.target.value)} 
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {q.type === 'Descriptive' && (
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-5 border border-indigo-100 dark:border-indigo-800">
                          <label className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-3 tracking-widest">
                            <HelpCircle className="w-3 h-3" /> AI Model Answer (Baseline for Similarity)
                          </label>
                          <textarea 
                            className="w-full bg-white/80 dark:bg-slate-900/50 border-none rounded-lg p-4 text-sm font-medium text-slate-700 dark:text-slate-300 min-h-[120px] focus:ring-2 focus:ring-indigo-500 outline-none resize-none shadow-inner shadow-slate-100 dark:shadow-none"
                            placeholder="Provide a detailed solution. The AI will analyze student vocabulary, concept depth, and reasoning based on this answer."
                            value={q.modelAnswer}
                            onChange={e => updateQuestion(index, 'modelAnswer', e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-slate-100 dark:border-slate-800 mt-8">
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-black text-xl shadow-lg shadow-slate-200 dark:shadow-none">
                  {calculateTotalMarks()}
                </div>
                <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total<br/>Points</div>
              </div>
              <Button onClick={handleCreateTest} disabled={isLoading || questions.length === 0} size="lg" className="px-10 h-14 rounded-2xl text-lg" icon={Save}>
                {isLoading ? 'Publishing...' : editingTestId ? 'Update Assessment' : 'Launch Assessment'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;

