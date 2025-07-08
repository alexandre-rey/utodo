import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { useTranslation } from 'react-i18next';
import { useTodosContext } from '../contexts/TodosContext';

export default function DesktopDashboard() {
  const { todos } = useTodosContext();
  const { t } = useTranslation();

  // Calculate stats
  const totalTodos = todos.length;
  const completedTodos = todos.filter(todo => todo.completed).length;
  const todayCompletedCount = todos.filter(todo => {
    const today = new Date().toDateString();
    const updatedDate = new Date(todo.updatedAt).toDateString();
    return todo.completed && updatedDate === today;
  }).length;

  const getProgressPercentage = () => {
    if (totalTodos === 0) return 0;
    return Math.round((completedTodos / totalTodos) * 100);
  };

  if (totalTodos === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto px-6 mb-6">
      <div className="grid grid-cols-4 gap-4">
        {/* Stats Cards */}
        <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalTodos}</div>
            <div className="text-sm text-gray-600">{t('dashboard.totalTodos')}</div>
          </div>
        </Card>
        
        <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{todayCompletedCount}</div>
            <div className="text-sm text-gray-600">{t('dashboard.completedToday')}</div>
          </div>
        </Card>
        
        <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{getProgressPercentage()}%</div>
            <div className="text-sm text-gray-600">{t('dashboard.progress')}</div>
          </div>
        </Card>

        {/* Progress Bar Card */}
        <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-sm">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{t('dashboard.overallProgress')}</span>
              <span className="text-sm text-gray-600">
                {completedTodos} / {totalTodos}
              </span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
        </Card>
      </div>
    </div>
  );
}