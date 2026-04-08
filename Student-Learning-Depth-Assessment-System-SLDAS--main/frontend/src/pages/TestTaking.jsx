import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/config';
import { 
  Clock, 
  Send, 
  AlertCircle, 
  Maximize, 
  ShieldAlert, 
  XCircle, 
  CheckCircle2, 
  BookOpen,
  Info,
  ChevronRight,
  ChevronLeft,
  Layout,
  Sparkles
} from 'lucide-react';
import { Button, Card, Badge, Loader } from '../components/UI';

const TestTaking = ({ user }) => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Anti-Cheat States
  const [isStarted, setIsStarted] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMsg, setWarningMsg] = useState("");
  const containerRef = useRef(null);
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const { data } = await api.get(`/api/tests/${testId}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setTest(data.test);
        setQuestions(data.questions);
        setTimeLeft(data.test.duration * 60);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId, user.token]);

  // Anti-Cheat Logic
  useEffect(() => {
    if (!isStarted || submitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation("Tab switching / Minimizing detected!");
      }
    };

    const handleFullScreenChange = () => {
      if (!document.fullscreenElement) {
        handleViolation("Full-screen mode exited!");
      }
    };

    const preventCopyPaste = (e) => {
      e.preventDefault();
      handleViolation("Copying or pasting is strictly prohibited!");
      return false;
    };

    const preventContextMenu = (e) => {
      e.preventDefault();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('copy', preventCopyPaste);
    document.addEventListener('paste', preventCopyPaste);
    document.addEventListener('cut', preventCopyPaste);
    document.addEventListener('contextmenu', preventContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('copy', preventCopyPaste);
      document.removeEventListener('paste', preventCopyPaste);
      document.removeEventListener('cut', preventCopyPaste);
      document.removeEventListener('contextmenu', preventContextMenu);
    };
  }, [isStarted, submitted, warningCount]);

  const handleViolation = (reason) => {
    if (submitted) return;
    
    const newCount = warningCount + 1;
    setWarningCount(newCount);
    setWarningMsg(reason);
    
    if (newCount >= 3) {
      alert("CRITICAL VIOLATION: Malpractice detected. Test terminated with zero marks.");
      handleSubmit(null, true);
    } else {
      setShowWarning(true);
    }
  };

  useEffect(() => {
    if (timeLeft <= 0 && isStarted && !loading && !submitted) {
      handleSubmit();
    }
    const timer = setInterval(() => {
      if (isStarted) setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading, submitted, isStarted]);

  const handleStartTest = () => {
    if (containerRef.current.requestFullscreen) {
      containerRef.current.requestFullscreen();
    } else if (containerRef.current.webkitRequestFullscreen) {
      containerRef.current.webkitRequestFullscreen();
    }
    setIsStarted(true);
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e, isMalpractice = false) => {
    if(e) e.preventDefault();
    
    // Final confirmation if not auto-submitting
    if (!isMalpractice && e && !window.confirm('Are you sure you want to submit your assessment?')) {
      return;
    }

    setSubmitted(true);
    try {
      const formattedAnswers = Object.keys(answers).map(qId => ({
        questionId: qId,
        providedAnswer: answers[qId]
      }));

      await api.post('/api/results/submit', {
        testId,
        answers: formattedAnswers,
        isMalpractice: isMalpractice
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      navigate(`/results/${testId}`);
    } catch (err) {
      console.error(err);
      setSubmitted(false);
      alert('Error submitting assessment. Please check your connection.');
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center"><Loader size="lg" /></div>;
  if (!test) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center"><Card className="text-center p-12 text-red-600 font-bold">Assessment Not Found</Card></div>;

  if (!isStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 dark:bg-slate-900 relative overflow-hidden transition-colors" ref={containerRef}>
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-100/50 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-indigo-100/50 rounded-full blur-3xl -ml-20 -mb-20"></div>

        <div className="w-full max-w-2xl animate-in fade-in zoom-in duration-700">
          <Card className="!p-10 text-center border-none shadow-2xl relative z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-500/20 mx-auto mb-8 rotate-6">
              <ShieldAlert className="w-10 h-10 text-white -rotate-6" />
            </div>
            
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2 uppercase">{test.title}</h2>
            <div className="flex items-center justify-center gap-6 mb-10 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">
               <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {test.duration} Minutes</div>
               <div className="flex items-center gap-1.5"><Layout className="w-4 h-4" /> {questions.length} Items</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 dark:bg-slate-900/50 rounded-[2rem] p-8 text-left mb-10 border border-slate-100 dark:border-slate-800 shadow-inner dark:shadow-none">
               <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Info className="w-4 h-4" /> Secure Exam Protocol
               </p>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex gap-3">
                     <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5"><CheckCircle2 className="w-4 h-4" /></div>
                     <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Full-Screen orientation is mandatory for security.</p>
                  </div>
                  <div className="flex gap-3">
                     <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5"><CheckCircle2 className="w-4 h-4" /></div>
                     <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Switching windows will trigger instant alerts.</p>
                  </div>
                  <div className="flex gap-3">
                     <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5"><CheckCircle2 className="w-4 h-4" /></div>
                     <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Copy/Paste functionality is strictly disabled.</p>
                  </div>
                  <div className="flex gap-3">
                     <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5"><CheckCircle2 className="w-4 h-4" /></div>
                     <p className="text-sm font-medium text-slate-600 dark:text-slate-300">AI monitoring active throughout the session.</p>
                  </div>
               </div>
            </div>

            <Button 
              onClick={handleStartTest}
              className="w-full py-5 text-xl font-black rounded-2xl shadow-blue-600/20 shadow-2xl h-18" 
              icon={Maximize}
            >
              Initialize Secure Mode
            </Button>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-6">Secure Assessment Environment v4.0</p>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 dark:bg-slate-900 selection:bg-none relative transition-colors" ref={containerRef}>
      {/* Violation Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 dark:bg-slate-50 dark:bg-slate-950/90 backdrop-blur-md p-4">
          <Card className="max-w-md w-full !p-10 text-center border-none shadow-[0_0_80px_rgba(244,63,94,0.2)] dark:bg-slate-900 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-200 dark:shadow-none">
               <ShieldAlert className="w-10 h-10 text-rose-600 dark:text-rose-400" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">INTEGRITY ALERT</h2>
            <p className="text-rose-600 dark:text-rose-400 font-bold mb-8">{warningMsg}</p>
            
            <div className="bg-slate-50 dark:bg-slate-950 dark:bg-slate-800/50 rounded-2xl p-6 mb-8 border border-slate-100 dark:border-slate-800">
              <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Penalties Remaining</p>
              <div className="flex justify-center gap-2 mb-2">
                 {[1, 2].map(i => (
                    <div key={i} className={`w-12 h-2 rounded-full ${warningCount >= i ? 'bg-rose-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                 ))}
              </div>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mt-4 underline underline-offset-4 decoration-rose-200">Termination on next violation</p>
            </div>
            
            <Button 
              onClick={() => {
                setShowWarning(false);
                if (!document.fullscreenElement) handleStartTest();
              }} 
              className="w-full bg-slate-900 hover:bg-black text-white h-14 rounded-xl"
            >
              Acknowledge & Resume
            </Button>
          </Card>
        </div>
      )}

      {/* Header with Progress */}
      <div className="fixed top-0 left-0 w-full bg-white/80 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 z-50">
         <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-slate-900 dark:bg-slate-800 rounded-xl flex items-center justify-center text-white font-black text-lg border border-transparent dark:border-slate-700">
                  {currentQuestionIndex + 1}
               </div>
               <div className="hidden sm:block">
                  <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1 uppercase">{test.title}</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Assessment In Progress</p>
               </div>
            </div>

            <div className="flex items-center gap-6">
               <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-mono font-black text-xl shadow-inner dark:shadow-none transition-all ${timeLeft < 300 ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                  <Clock className="w-5 h-5 opacity-40 shrink-0" />
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
               </div>
               <Button onClick={() => handleSubmit()} variant="success" className="hidden md:flex font-black tracking-widest uppercase text-xs h-12 shadow-emerald-100">End Session</Button>
            </div>
         </div>
         {/* Progress Indicator */}
         <div className="w-full h-1.5 bg-slate-100">
            <div 
               className="h-full bg-blue-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
               style={{ width: `${progress}%` }}
            ></div>
         </div>
      </div>

      <div className="max-w-3xl mx-auto p-6 pt-32 pb-40">
        <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div key={currentQuestion._id} className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between mb-8">
               <Badge variant="info" className="!bg-blue-50 text-blue-600 border-none py-1.5 px-4 font-black uppercase tracking-widest text-[10px]">
                  Points Reward: {currentQuestion.marks}
               </Badge>
               {warningCount > 0 && <Badge variant="danger" className="animate-pulse">Security Warning active</Badge>}
            </div>

            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-10 leading-tight">
               {currentQuestion.question}
            </h3>

            {currentQuestion.type === 'MCQ' ? (
              <div className="grid grid-cols-1 gap-4">
                {currentQuestion.options.map((opt, i) => (
                  <label key={i} className={`flex items-center p-6 border-2 rounded-[2rem] cursor-pointer transition-all duration-300 group shadow-sm ${answers[currentQuestion._id] === opt ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-blue-200 dark:hover:border-blue-800'}`}>
                    <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center mr-6 transition-all ${answers[currentQuestion._id] === opt ? 'bg-blue-600 border-blue-600' : 'bg-slate-50 dark:bg-slate-950 dark:bg-slate-900 border-slate-200 dark:border-slate-700 group-hover:border-blue-300'}`}>
                       {answers[currentQuestion._id] === opt && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                    </div>
                    <input 
                      type="radio" 
                      name={currentQuestion._id} 
                      value={opt}
                      checked={answers[currentQuestion._id] === opt}
                      onChange={() => handleAnswerChange(currentQuestion._id, opt)}
                      className="hidden"
                    />
                    <span className={`text-xl font-bold ${answers[currentQuestion._id] === opt ? 'text-blue-900 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'}`}>{opt}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="relative group">
                <div className="absolute -top-3 left-6 flex items-center gap-1.5 px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 z-10">
                  <Sparkles className="w-3 h-3" /> AI Analysis Active
                </div>
                <textarea 
                  className="w-full min-h-[300px] rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-10 text-xl font-medium text-slate-800 dark:text-slate-200 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-600 outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-600 shadow-xl shadow-slate-100/50 dark:shadow-none resize-none leading-relaxed"
                  placeholder="Articulate your response with clarity and conceptual depth..."
                  value={answers[currentQuestion._id] || ''}
                  onCopy={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                  onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-slate-50 via-slate-50 dark:from-slate-900 dark:via-slate-900 to-transparent p-10 z-50">
             <div className="max-w-3xl mx-auto flex items-center justify-between gap-6">
                <Button 
                   type="button"
                   variant="secondary" 
                   disabled={currentQuestionIndex === 0}
                   onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                   className="flex-1 py-4 !rounded-2xl"
                   icon={ChevronLeft}
                >
                   Previous
                </Button>
                
                {currentQuestionIndex === questions.length - 1 ? (
                   <Button 
                      type="button"
                      onClick={() => handleSubmit()} 
                      disabled={submitted}
                      className="flex-[2] py-4 !rounded-2xl bg-slate-900 dark:bg-slate-800 shadow-xl shadow-slate-200 dark:shadow-none h-14 text-white hover:bg-black dark:hover:bg-slate-700"
                   >
                       {submitted ? 'Processing Final Eval...' : 'Final Submission'}
                   </Button>
                ) : (
                   <Button 
                      type="button"
                      onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                      className="flex-[2] py-4 !rounded-2xl h-14"
                   >
                      Next Question <ChevronRight className="w-5 h-5 ml-2" />
                   </Button>
                )}
             </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestTaking;

