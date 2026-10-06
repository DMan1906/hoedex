import { useEffect, useState } from 'react';
import { databases, account, DB_ID, MILESTONES_COLLECTION_ID } from '../appwrite';
import { Query } from 'appwrite';
import { Award, Trophy, Star, Shield, Target } from 'lucide-react';

const ALL_BADGES = [
  { id: 'first_catch', name: 'First Catch', description: 'Log your very first animal.', icon: <Target size={32} /> },
  { id: '10_catches', name: '10 Catches', description: 'Log 10 animals in total.', icon: <Award size={32} /> },
  { id: '100_catches', name: '100 Catches', description: 'Log 100 animals in total.', icon: <Trophy size={32} /> },
  { id: '1000_catches', name: '1000 Catches', description: 'Log 1000 animals in total.', icon: <Trophy size={32} /> },
  { id: 'first_legendary', name: 'First Legendary', description: 'Find your first legendary animal.', icon: <Star size={32} /> },
  { id: '10_legendaries', name: 'Legendary Hunter', description: 'Find 10 legendary animals.', icon: <Star size={32} className="text-yellow-500" /> },
  { id: '5_breeds', name: 'Diverse (5 Breeds)', description: 'Log 5 distinct animal breeds.', icon: <Shield size={32} /> },
  { id: '10_breeds', name: 'Diverse (10 Breeds)', description: 'Log 10 distinct animal breeds.', icon: <Shield size={32} /> },
  { id: '25_breeds', name: 'Diverse (25 Breeds)', description: 'Log 25 distinct animal breeds.', icon: <Shield size={32} /> },
];

export default function Milestones() {
  const [unlockedMilestones, setUnlockedMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const user = await account.get();
        const response = await databases.listDocuments(
          DB_ID,
          MILESTONES_COLLECTION_ID,
          [Query.equal('user_id', user.$id)]
        );
        setUnlockedMilestones(response.documents.map(d => d.milestone_name));
      } catch (error) {
        console.error('Failed to fetch milestones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMilestones();
  }, []);

  if (loading) return <div className="text-center p-8 text-gray-500">Loading your badges...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 mt-4">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-200 mb-2">Milestones & Badges</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Unlock badges by logging catches and discovering new breeds.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {ALL_BADGES.map((badge) => {
          const isUnlocked = unlockedMilestones.includes(badge.id);
          
          return (
            <div 
              key={badge.id} 
              className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-3 ${
                isUnlocked 
                  ? 'bg-white dark:bg-gray-800 border-brand-500 dark:border-brand-500 shadow-sm' 
                  : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 grayscale opacity-60'
              }`}
            >
              <div className={`p-4 rounded-full ${isUnlocked ? 'bg-brand-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                {badge.icon}
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isUnlocked ? 'text-gray-900 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'}`}>
                  {badge.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{badge.description}</p>
              </div>
              {isUnlocked && (
                <span className="mt-2 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest bg-brand-50 dark:bg-gray-800 px-2 py-1 rounded-md">
                  Unlocked
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
