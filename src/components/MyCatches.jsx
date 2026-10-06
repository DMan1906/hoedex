import { useEffect, useState } from 'react';
import { databases, storage, account, DB_ID, CATCHES_COLLECTION_ID, BUCKET_ID, ID } from '../appwrite';
import { Query } from 'appwrite';
import Milestones from './Milestones';

export default function MyCatches() {
  const [catches, setCatches] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('catches'); // 'catches' | 'badges'
  const [isUploading, setIsUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchMyData = async () => {
      try {
        const user = await account.get();
        setCurrentUser(user);

        const profileReq = await databases.listDocuments(DB_ID, 'profiles', [
          Query.equal('user_id', user.$id)
        ]);
        if (profileReq.documents.length > 0) {
          setProfile(profileReq.documents[0]);
        }

        const response = await databases.listDocuments(
          DB_ID,
          CATCHES_COLLECTION_ID,
          [
            Query.equal('user_id', user.$id),
            Query.orderDesc('created_at')
          ]
        );
        setCatches(response.documents);
      } catch (error) {
        console.error('Failed to fetch personal data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyData();
  }, []);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !profile) return;
    try {
      setIsUploading(true);
      const uploadedFile = await storage.createFile(BUCKET_ID, ID.unique(), file);
      
      const updatedProfile = await databases.updateDocument(DB_ID, 'profiles', profile.$id, {
        avatar_id: uploadedFile.$id
      });
      setProfile(updatedProfile);
    } catch (err) {
      console.error('Avatar upload failed', err);
      alert('Avatar upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return <div className="text-center p-8 text-gray-500">Loading your catches...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 mt-4 space-y-6">
      {/* Profile Header */}
      {profile && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            {profile.avatar_id ? (
              <img 
                src={storage.getFileView(BUCKET_ID, profile.avatar_id)} 
                alt={profile.name}
                className="w-24 h-24 rounded-full object-cover shadow-md border-4 border-white dark:border-gray-800"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-brand-100 dark:bg-gray-800 text-brand-600 dark:text-brand-300 flex items-center justify-center font-bold text-3xl shadow-md border-4 border-white dark:border-gray-800">
                {profile.name?.charAt(0).toUpperCase()}
              </div>
            )}
            
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <span className="text-xs font-medium">{isUploading ? 'Uploading...' : 'Change'}</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarUpload}
                disabled={isUploading}
              />
            </label>
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-200">{profile.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">{catches.length} Total Catches</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button 
          className={`flex-1 py-3 text-center font-bold transition-colors ${activeTab === 'catches' ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600 dark:border-brand-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
          onClick={() => setActiveTab('catches')}
        >
          My Catches
        </button>
        <button 
          className={`flex-1 py-3 text-center font-bold transition-colors ${activeTab === 'badges' ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600 dark:border-brand-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
          onClick={() => setActiveTab('badges')}
        >
          Badges
        </button>
      </div>

      {activeTab === 'catches' ? (
        <>
          {catches.length === 0 && (
            <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't logged any catches yet.</p>
            </div>
          )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {catches.map((item) => {
          const overall = ((item.rating_face + item.rating_body + item.rating_personality + item.rating_compatibility + (11 - item.rating_red_flags)) / 5).toFixed(1);
          return (
            <div key={item.$id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col">
              <img 
                src={storage.getFileView(BUCKET_ID, item.image_id)} 
                alt={item.name || item.animal_breed}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-200 flex items-center gap-2">
                      {item.name ? `${item.name} (${item.animal_breed})` : item.animal_breed}
                      {item.is_legendary && (
                        <span className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide">
                          Legendary
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                      {item.country_of_origin} {item.age !== null && item.age !== undefined && `• Age: ${item.age}`}
                    </p>
                  </div>
                </div>

                {item.owner_contact && (
                  <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mb-2">Owner: {item.owner_contact}</p>
                )}

                {(item.rating_face || item.rating_personality) && (
                  <div className="mt-2 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg text-xs flex justify-between text-center items-center mb-2">
                    <div><div className="text-[10px] text-gray-500 dark:text-gray-400">Face</div><div className="font-bold dark:text-gray-200 text-sm">{item.rating_face || '-'}</div></div>
                    <div><div className="text-[10px] text-gray-500 dark:text-gray-400">Body</div><div className="font-bold dark:text-gray-200 text-sm">{item.rating_body || '-'}</div></div>
                    <div><div className="text-[10px] text-gray-500 dark:text-gray-400">Pers</div><div className="font-bold dark:text-gray-200 text-sm">{item.rating_personality || '-'}</div></div>
                    <div><div className="text-[10px] text-gray-500 dark:text-gray-400">Comp</div><div className="font-bold dark:text-gray-200 text-sm">{item.rating_compatibility || '-'}</div></div>
                    <div><div className="text-[10px] text-red-500 dark:text-red-400">Flags</div><div className="font-bold text-red-600 dark:text-red-400 text-sm">{item.rating_red_flags || '-'}</div></div>
                    <div className="pl-1 border-l border-gray-200 dark:border-gray-600"><div className="text-[10px] text-brand-600 dark:text-brand-400">Avg</div><div className="font-bold text-brand-600 dark:text-brand-400 text-sm">{overall !== 'NaN' ? overall : '-'}</div></div>
                  </div>
                )}

                <span className="text-xs text-gray-400 block mt-auto pt-2 border-t border-gray-50 dark:border-gray-700">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      </>
      ) : (
        <Milestones />
      )}
    </div>
  );
}
