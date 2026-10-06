import { useEffect, useState } from 'react';
import { databases, DB_ID, storage, BUCKET_ID } from '../appwrite';
import { Query } from 'appwrite';
import { Link } from 'react-router-dom';

export default function Friends() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await databases.listDocuments(DB_ID, 'profiles', [
          Query.orderDesc('catches_count'),
          Query.limit(100)
        ]);
        setProfiles(response.documents);
      } catch (error) {
        console.error('Failed to fetch profiles', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  if (loading) return <div className="text-center p-8 text-gray-500">Loading friends...</div>;

  const top3 = profiles.slice(0, 3);
  const rest = profiles.slice(3);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-200 mb-6">Friends & Leaderboard</h1>
      
      {/* Top 3 Leaderboard */}
      {top3.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-brand-600 dark:text-brand-400 mb-4 flex items-center gap-2">
            🏆 Top Catchers
          </h2>
          <div className="space-y-4">
            {top3.map((profile, index) => (
              <Link 
                key={profile.$id} 
                to={`/user/${profile.user_id}`}
                className="flex items-center p-3 hover:bg-brand-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <div className="flex-shrink-0 w-8 font-bold text-gray-400 dark:text-gray-500">
                  #{index + 1}
                </div>
                <div className="flex-shrink-0">
                  {profile.avatar_id ? (
                    <img 
                      src={storage.getFileView(BUCKET_ID, profile.avatar_id)} 
                      alt={profile.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-800"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-gray-800 text-brand-600 dark:text-brand-300 flex items-center justify-center font-bold text-xl border-2 border-white dark:border-gray-800">
                      {profile.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-grow">
                  <h3 className="font-bold text-gray-900 dark:text-gray-200">{profile.name}</h3>
                  <p className="text-sm text-brand-600 dark:text-brand-400">{profile.catches_count} catches</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Rest of Users */}
      {rest.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-4">All Users</h3>
          <div className="space-y-2">
            {rest.map((profile, index) => (
              <Link 
                key={profile.$id} 
                to={`/user/${profile.user_id}`}
                className="flex items-center p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors border border-gray-100 dark:border-gray-700 shadow-sm"
              >
                <div className="flex-shrink-0 w-8 font-medium text-gray-400 dark:text-gray-500 text-sm">
                  #{index + 4}
                </div>
                <div className="flex-shrink-0">
                  {profile.avatar_id ? (
                    <img 
                      src={storage.getFileView(BUCKET_ID, profile.avatar_id)} 
                      alt={profile.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold">
                      {profile.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="ml-3 flex-grow">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">{profile.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{profile.catches_count} catches</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
