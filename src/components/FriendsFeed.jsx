import { useEffect, useState } from 'react';
import { databases, storage, DB_ID, CATCHES_COLLECTION_ID, BUCKET_ID } from '../appwrite';
import { Query } from 'appwrite';

export default function FriendsFeed() {
  const [catches, setCatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatches = async () => {
      try {
        const response = await databases.listDocuments(
          DB_ID,
          CATCHES_COLLECTION_ID,
          [Query.orderDesc('created_at'), Query.limit(25)]
        );
        setCatches(response.documents);
      } catch (error) {
        console.error('Failed to fetch catches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCatches();
  }, []);

  if (loading) return <div className="text-center p-8 text-gray-500">Loading feed...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-200 mb-6">Global Feed</h1>
      {catches.length === 0 && <p className="text-gray-500">No catches yet. Be the first!</p>}
      {catches.map((item) => (
        <div key={item.$id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
          <img 
            src={storage.getFileView(BUCKET_ID, item.image_id)} 
            alt={item.animal_breed}
            className="w-full h-64 object-cover"
            loading="lazy"
          />
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200 flex items-center gap-2">
                  {item.name ? `${item.name} (${item.animal_breed})` : item.animal_breed}
                  {item.is_legendary && (
                    <span className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 text-xs px-2 py-1 rounded-full uppercase font-bold tracking-wide">
                      Legendary
                    </span>
                  )}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {item.country_of_origin} {item.age !== null && item.age !== undefined && `• Age: ${item.age}`}
                </p>
              </div>
              <span className="text-xs text-gray-400 font-medium">
                {new Date(item.created_at).toLocaleDateString()}
              </span>
            </div>
            
            {item.owner_contact && (
              <p className="text-sm text-brand-600 dark:text-brand-400 font-medium mt-2">Phone / Instagram: {item.owner_contact}</p>
            )}

            {(item.rating_face || item.rating_personality) && (
              <div className="mt-3 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg text-sm flex justify-between text-center items-center">
                <div><div className="text-[10px] text-gray-500 dark:text-gray-400">Face</div><div className="font-bold dark:text-gray-200 text-sm">{item.rating_face || '-'}</div></div>
                <div><div className="text-[10px] text-gray-500 dark:text-gray-400">Body</div><div className="font-bold dark:text-gray-200 text-sm">{item.rating_body || '-'}</div></div>
                <div><div className="text-[10px] text-gray-500 dark:text-gray-400">Pers</div><div className="font-bold dark:text-gray-200 text-sm">{item.rating_personality || '-'}</div></div>
                <div><div className="text-[10px] text-gray-500 dark:text-gray-400">Comp</div><div className="font-bold dark:text-gray-200 text-sm">{item.rating_compatibility || '-'}</div></div>
                <div><div className="text-[10px] text-red-500 dark:text-red-400">Flags</div><div className="font-bold text-red-600 dark:text-red-400 text-sm">{item.rating_red_flags || '-'}</div></div>
                <div className="pl-2 border-l border-gray-200 dark:border-gray-600">
                  <div className="text-[10px] text-brand-600 dark:text-brand-400">Overall</div>
                  <div className="font-bold text-brand-600 dark:text-brand-400 text-sm">
                    {((item.rating_face + item.rating_body + item.rating_personality + item.rating_compatibility + (11 - item.rating_red_flags)) / 5).toFixed(1)}
                  </div>
                </div>
              </div>
            )}

            {item.is_legendary && item.special_characteristics && (
              <div className="mt-3 bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg border border-yellow-100 dark:border-yellow-700/50">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 italic">"{item.special_characteristics}"</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
