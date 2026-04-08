import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/config';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Brain, 
  Target, 
  Award, 
  Users, 
  MessageSquare, 
  Sparkles, 
  SendHorizontal,
  TrendingUp,
  History,
  Lightbulb,
  ChevronRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button, Card, Badge, Loader } from '../components/UI';

ChartJS.register(ArcElement, Tooltip, Legend);

const ResultDashboard = ({ user }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { testId, resultId } = useParams();
  
  // Chat States
  const [chatHistories, setChatHistories] = useState({}); // { resultId: [ {sender, text} ] }
  const [chatInputs, setChatInputs] = useState({}); 
  const [isTyping, setIsTyping] = useState({});
  const chatEndRefs = useRef({});

  useEffect(() => {
    Object.values(chatEndRefs.current).forEach(el => {
      if (el) el.scrollIntoView({ behavior: "smooth" });
    });
  }, [chatHistories, isTyping]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        let resultsData = [];
        if (resultId) {
          const { data } = await api.get(`/api/results/details/${resultId}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          resultsData = [data];
        } else {
          const { data } = await api.get('/api/results/my-results', {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          resultsData = data;
          if (testId) {
            resultsData = data.filter(r => (r.testId?._id || r.testId) === testId);
          }
        }
        setResults(resultsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [user.token, testId, resultId]);

  const handleSendMessage = async (resultId) => {
    const text = chatInputs[resultId];
    if (!text?.trim()) return;

    const newMessage = { sender: 'user', text };
    setChatHistories(prev => ({
      ...prev,
      [resultId]: [...(prev[resultId] || []), newMessage]
    }));
    setChatInputs(prev => ({ ...prev, [resultId]: '' }));
    setIsTyping(prev => ({ ...prev, [resultId]: true }));

    try {
      const { data } = await api.post('/api/results/chat', {
        resultId,
        message: text
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      const aiReply = { sender: 'ai', text: data.reply };
      setChatHistories(prev => ({
        ...prev,
        [resultId]: [...(prev[resultId] || []), aiReply]
      }));
    } catch (err) {
      console.error(err);
      alert('Chat Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsTyping(prev => ({ ...prev, [resultId]: false }));
    }
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader size="lg" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Performance Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Deep insights driven by AI multi-dimensional analysis.</p>
        </div>
        
        {results.length === 1 && resultId && results[0].studentId && (
          <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 pr-4 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              {results[0].studentId.name[0]}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Assessed Student</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{results[0].studentId.name}</p>
            </div>
          </div>
        )}
      </div>

      {results.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 text-center border-dashed border-2 text-slate-900 dark:text-white">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950/20 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
            <History className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Assessment History</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-2">Finish your first assessment to unlock comprehensive AI analytics and personalized roadmaps.</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-6">Back to Assessments</Button>
        </Card>
      ) : (
        <div className="space-y-10">
          {results.map((result) => {
            const chartData = {
              labels: ['Lost Marks', 'Obtained Marks'],
              datasets: [{
                data: [100 - result.percentage, result.percentage],
                backgroundColor: ['#f1f5f9', '#3b82f6'],
                hoverBackgroundColor: ['#e2e8f0', '#2563eb'],
              }],
            };

            return (
              <div key={result._id} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="flex flex-col items-center !p-8 h-full transition-all shadow-md group border-none">
                    <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6">Subject Score</h3>
                    
                    <div className="relative w-44 h-44 mb-8">
                      <Pie 
                        data={chartData} 
                        options={{ 
                          maintainAspectRatio: true, 
                          cutout: '82%',
                          plugins: { legend: { display: false }, tooltip: { enabled: false } }
                        }} 
                      />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{result.percentage.toFixed(0)}</span>
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-bold tracking-widest uppercase">Percent</span>
                      </div>
                    </div>

                    <div className="w-full space-y-4">
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/20 dark:bg-slate-900/50 flex items-center gap-4 border border-slate-100 dark:border-slate-800 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/30 group-hover:border-blue-100 dark:group-hover:border-blue-800 transition-all">
                        <div className={`p-2.5 rounded-xl ${result.scoreLevel === 'Expert' ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'}`}>
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1.5">Expertise Level</p>
                          <p className="text-lg font-black text-slate-800 dark:text-slate-200 leading-none">{result.scoreLevel}</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="lg:col-span-2 !p-0 border-none shadow-xl shadow-indigo-900/5 dark:shadow-none relative overflow-hidden flex flex-col">
                    <div className="p-8 pb-1 flex-1">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                          <Brain className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                          AI Learning Roadmap
                        </h3>
                        <Badge variant="info" className="!bg-indigo-600 text-white border-none py-1.5 px-4 font-bold tracking-widest uppercase text-[10px] shadow-lg shadow-indigo-200">Insight Pack</Badge>
                      </div>

                      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2rem] text-white shadow-2xl shadow-slate-200 relative overflow-hidden group mb-8">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative z-10">
                          <p className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Evaluative Summary
                          </p>
                          <p className="text-2xl font-light leading-relaxed italic pr-4">
                             "{result.overallFeedback}"
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pb-8">
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                           <div className="flex items-center gap-2 mb-2">
                             <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                             <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Strength</span>
                           </div>
                           <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{result.percentage > 70 ? 'Excellent concept retention' : 'Partial understanding'}</p>
                        </div>
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/30 rounded-2xl border border-amber-100 dark:border-amber-800">
                           <div className="flex items-center gap-2 mb-2">
                             <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                             <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Focus Area</span>
                           </div>
                           <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{result.percentage < 60 ? 'Deep fundamental review' : 'Practical application'}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Sub-Answers & Chat */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Detailed Analysis */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-md overflow-hidden flex flex-col h-[700px]">
                    <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-800 sticky top-0 z-10 transition-colors">
                       <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                         <Target className="w-5 h-5 text-rose-500" /> Segment Analysis
                       </h4>
                       <Badge variant="neutral">{result.answers.length} Items</Badge>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50 dark:bg-slate-950/20 dark:bg-slate-900/30">
                      {result.answers.map((ans, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.22em]">Question {idx + 1}</span>
                            <Badge variant={ans.marksAwarded > 0 ? 'success' : 'danger'} className="font-black">
                              {ans.marksAwarded} / 10 Points
                            </Badge>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                               <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">{ans.questionId?.question || 'Question text unavailable'}</p>
                            </div>

                            <div>
                               <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 leading-none uppercase tracking-widest">Candidate Input</p>
                               <div className="p-3 bg-slate-50 dark:bg-slate-950/20 dark:bg-slate-900/50 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 italic border border-slate-100 dark:border-slate-800">
                                 {ans.providedAnswer || 'No response recorded.'}
                               </div>
                            </div>

                            <div>
                               <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1 leading-none uppercase tracking-widest">Correct Answer</p>
                               <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-sm font-medium text-emerald-800 dark:text-emerald-200 border border-emerald-100 dark:border-emerald-800">
                                 {ans.questionId?.type === 'MCQ' ? ans.questionId?.correctAnswer : ans.questionId?.modelAnswer || 'Not available.'}
                               </div>
                            </div>
                            
                            {ans.feedback && (
                              <div className="flex gap-3 text-sm text-indigo-700 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800">
                                <Brain className="w-5 h-5 shrink-0 text-indigo-400 dark:text-indigo-500" />
                                <p className="font-medium leading-relaxed">{ans.feedback}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Chat Interface */}
                  <div className="border border-slate-200 dark:border-slate-800 shadow-2xl shadow-indigo-900/5 dark:shadow-none overflow-hidden flex flex-col h-[700px] bg-gradient-to-br from-slate-50 dark:from-slate-900 to-transparent relative rounded-3xl">
                     <div className="absolute top-0 right-0 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 dark:opacity-10 -mr-20 -mt-20"></div>
                     <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 dark:opacity-10 -ml-20 -mb-20"></div>

                     <div className="relative p-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-20 shadow-md rounded-t-3xl">
                        <div className="flex items-center gap-4 relative">
                           <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/50">
                              <Sparkles className="w-6 h-6 text-white" />
                           </div>
                           <div>
                              <h4 className="font-black text-white text-xl tracking-tight leading-none mb-1.5">Nexus AI Tutor</h4>
                              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Brain className="w-3.5 h-3.5" /> Interactive Learning Coach
                              </p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2.5 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
                           <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                           <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Active</span>
                        </div>
                     </div>

                     <div className="relative flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar z-10">
                        {(chatHistories[result._id] || []).length === 0 ? (
                           <div className="h-full flex flex-col items-center justify-center text-center p-8">
                              <div className="w-20 h-20 bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-full flex items-center justify-center mb-6">
                                <MessageSquare className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
                              </div>
                              <p className="text-xl text-slate-800 dark:text-slate-200 font-extrabold mb-2">Ready to master this topic?</p>
                              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[250px] font-medium leading-relaxed">Ask me about marks deduction, complex concepts, or specific questions in your assessment.</p>
                           </div>
                        ) : (
                           chatHistories[result._id].map((msg, mIdx) => (
                              <div key={mIdx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-3`}>
                                 {msg.sender === 'ai' && (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md mr-3 shrink-0 mt-auto">
                                       <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                 )}
                                 <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm font-medium ${
                                    msg.sender === 'user' 
                                       ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-tr-sm shadow-slate-900/20' 
                                       : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700 rounded-bl-sm shadow-slate-200/50 dark:shadow-none prose prose-sm dark:prose-invert prose-slate max-w-none'
                                 }`}>
                                    {msg.sender === 'user' ? (
                                       msg.text
                                    ) : (
                                       <ReactMarkdown>{msg.text}</ReactMarkdown>
                                    )}
                                 </div>
                              </div>
                           ))
                        )}
                        {isTyping[result._id] && (
                           <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shrink-0">
                                 <Sparkles className="w-4 h-4 text-white" />
                              </div>
                              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl rounded-bl-sm flex gap-1 shadow-sm">
                                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                              </div>
                           </div>
                        )}
                        <div ref={el => chatEndRefs.current[result._id] = el} />
                     </div>

                     <div className="relative p-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 z-10 transition-colors">
                        <form 
                           onSubmit={(e) => { e.preventDefault(); handleSendMessage(result._id); }} 
                           className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-all"
                        >
                           <input 
                              type="text" 
                              className="w-full bg-transparent py-4 pl-6 pr-16 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none font-medium"
                              placeholder="Type your question here..."
                              value={chatInputs[result._id] || ''}
                              onChange={(e) => setChatInputs(prev => ({ ...prev, [result._id]: e.target.value }))}
                              disabled={isTyping[result._id]}
                           />
                           <button 
                              type="submit" 
                              disabled={isTyping[result._id] || !(chatInputs[result._id]?.trim())}
                              className="absolute right-2 top-1.5 bottom-1.5 aspect-square bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                           >
                              <SendHorizontal className="w-5 h-5 -ml-0.5" />
                           </button>
                        </form>
                     </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResultDashboard;

