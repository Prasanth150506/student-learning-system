import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, Clock, Activity, ChevronRight, Trophy, Target, TrendingUp, Search } from 'lucide-react';
import { Button, Card, Badge, Loader } from '../components/UI';

const Dashboard = ({ user }) => {
  const [tests, setTests] = useState([]);
  const [completedTestIds, setCompletedTestIds] = useState(new Set());
  const [averageScore, setAverageScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTestsAndResults = async () => {
      try {
        const [testsRes, resultsRes] = await Promise.all([
          axios.get('http://127.0.0.1:5000/api/tests', { headers: { Authorization: `Bearer ${user.token}` } }),
          axios.get('http://127.0.0.1:5000/api/results/my-results', { headers: { Authorization: `Bearer ${user.token}` } })
        ]);
        
        setTests(testsRes.data);
        const completedIds = new Set(
          resultsRes.data
            .filter(r => r.testId)
            .map(r => r.testId._id || r.testId)
        );
        setCompletedTestIds(completedIds);
        
        if (resultsRes.data && resultsRes.data.length > 0) {
          const totalPercentage = resultsRes.data.reduce((sum, r) => sum + (r.percentage || 0), 0);
          setAverageScore(Math.round(totalPercentage / resultsRes.data.length));
        } else {
          setAverageScore(0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTestsAndResults();
  }, [user.token]);

  const filteredTests = tests.filter(test => 
    test.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Welcome back, {user.name.split(' ')[0]}! Ready for your next challenge?</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => navigate('/results')} icon={TrendingUp}>My Progress</Button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-blue-200">
          <div className="p-3 bg-white/20 rounded-xl">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-bold">{completedTestIds.size} <span className="text-sm font-medium opacity-80">Assessments</span></p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/40 rounded-xl">
            <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Available</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{tests.length - completedTestIds.size} <span className="text-sm font-medium text-slate-400 dark:text-slate-500">ToGo</span></p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/40 rounded-xl">
            <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Knowledge Score</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{averageScore}% <span className="text-sm font-medium text-slate-400 dark:text-slate-500">Avg.</span></p>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="text-blue-600 dark:text-blue-400 w-5 h-5" />
            Learning Pathways
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter assessments..." 
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl h-56 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {filteredTests.length === 0 ? (
              <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No assessments found</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-xs">We couldn't find any assessments matching your current search criteria.</p>
                <Button variant="ghost" className="mt-4" onClick={() => setSearchQuery('')}>Clear Search</Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTests.map(test => {
                  const isCompleted = completedTestIds.has(test._id);
                  return (
                    <Card key={test._id} className="flex flex-col h-full group hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 !p-0">
                      <div className="p-6 flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                            <BookOpen className="w-6 h-6" />
                          </div>
                          {isCompleted ? (
                            <Badge variant="success">Completed</Badge>
                          ) : (
                            <Badge variant="info">New</Badge>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-tight">{test.title}</h3>
                        <div className="flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400 mt-4">
                          <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-950 dark:bg-slate-900/50 rounded-md"><Clock className="w-4 h-4 text-slate-400" /> {test.duration}m</span>
                          <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-950 dark:bg-slate-900/50 rounded-md"><Activity className="w-4 h-4 text-slate-400" /> {test.totalMarks} pts</span>
                        </div>
                      </div>
                      <div className="px-6 py-4 border-t border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/30 dark:bg-slate-900/30">
                        <Button 
                          variant={isCompleted ? 'secondary' : 'primary'}
                          className="w-full justify-between pr-3 group/btn"
                          onClick={() => isCompleted ? navigate(`/results/${test._id}`) : navigate(`/test/${test._id}`)}
                        >
                          <span>{isCompleted ? 'Review Performance' : 'Start Assessment'}</span>
                          <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>


    </div>
  );
};

export default Dashboard;

