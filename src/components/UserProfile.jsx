import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { databases, storage, DB_ID, CATCHES_COLLECTION_ID, BUCKET_ID } from '../appwrite';
import { Query } from 'appwrite';
import { ArrowLeft, Search, Filter } from 'lucide-react';

export default function UserProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [catches, setCatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [filterBreed, setFilterBreed] = useState('All');
  const [filterLegendary, setFilterLegendary] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const profileReq = await databases.listDocuments(DB_ID, 'profiles', [
          Query.equal('user_id', id)
        ]);
        if (profileReq.documents.length > 0) {
          setProfile(profileReq.documents[0]);
        }

        const catchesReq = await databases.listDocuments(DB_ID, CATCHES_COLLECTION_ID, [
          Query.equal('user_id', id),
          Query.orderDesc('created_at'),
          Query.limit(100)
        ]);
        setCatches(catchesReq.documents);
      } catch (error) {
        console.error('Failed to fetch user profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) return <div className="text-center p-8 text-gray-500">Loading profile...</div>;
  if (!profile) return <div className="text-center p-8 text-gray-500">User not found</div>;

  // Stats calculation
  const totalCatches = catches.length;
  const legendaries = catches.filter(c => c.is_legendary).length;
  const breedsCount = {};
  let totalRating = 0;
  let ratedCatches = 0;

  catches.forEach(c => {
    breedsCount[c.animal_breed] = (breedsCount[c.animal_breed] || 0) + 1;
    if (c.rating_face) {
      totalRating += ((c.rating_face + c.rating_body + c.rating_personality + c.rating_compatibility + (11 - c.rating_red_flags)) / 5);
      ratedCatches++;
    }
  });

  const topBreed = Object.keys(breedsCount).sort((a,b) => breedsCount[b] - breedsCount[a])[0] || '-';
  const avgRating = ratedCatches > 0 ? (totalRating / ratedCatches).toFixed(1) : '-';
  const allBreeds = [...new Set(catches.map(c => c.animal_breed))];

  // Filtering
  const filteredCatches = catches.filter(c => {
    if (filterBreed !== 'All' && c.animal_breed !== filterBreed) return false;
    if (filterLegendary === 'Legendary' && !c.is_legendary) return false;
    if (filterLegendary === 'Normal' && c.is_legendary) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = c.name?.toLowerCase().includes(q);
      const matchOwner = c.owner_contact?.toLowerCase().includes(q);
      if (!matchName && !matchOwner) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
    if (sortBy === 'rating') {
      const ratingA = (a.rating_face + a.rating_body + a.rating_personality + a.rating_compatibility + (11 - a.rating_red_flags)) / 5 || 0;
      const ratingB = (b.rating_face + b.rating_body + b.rating_personality + b.rating_compatibility + (11 - b.rating_red_flags)) / 5 || 0;
      return ratingB - ratingA;
    }
    return 0;
  });

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center mb-6 gap-4">
        <Link to="/friends" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-4">
          {profile.avatar_id ? (
            <img 
              src={storage.getFileView(BUCKET_ID, profile.avatar_id)} 
              alt={profile.name}
              className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-white dark:border-gray-800"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-brand-100 dark:bg-gray-800 text-brand-600 dark:text-brand-300 flex items-center justify-center font-bold text-2xl shadow-md border-2 border-white dark:border-gray-800">
              {profile.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-200">{profile.name}</h1>
            <p className="text-gray-500 dark:text-gray-400">Profile</p>
          </div>
        </div>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-200">{totalCatches}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Total Catches</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-2xl shadow-sm border border-yellow-100 dark:border-yellow-700/50 text-center">
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{legendaries}</div>
          <div className="text-xs text-yellow-600 dark:text-yellow-500 uppercase font-semibold">Legendaries</div>
        </div>
        <div className="bg-brand-50 dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-brand-100 dark:border-gray-700 text-center">
          <div className="text-2xl font-bold text-brand-700 dark:text-brand-400">{avgRating}</div>
          <div className="text-xs text-brand-600 dark:text-brand-500 uppercase font-semibold">Avg Rating</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-2xl shadow-sm border border-purple-100 dark:border-purple-700/50 text-center">
          <div className="text-lg font-bold text-purple-700 dark:text-purple-400 truncate" title={topBreed}>{topBreed}</div>
          <div className="text-xs text-purple-600 dark:text-purple-500 uppercase font-semibold">Top Race</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
        <div className="flex gap-2 items-center bg-gray-50 dark:bg-gray-700 p-2 rounded-lg border border-gray-200 dark:border-gray-600">
          <Search size={20} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name or Instagram/phone..." 
            className="bg-transparent border-none focus:ring-0 w-full text-sm outline-none dark:text-gray-200 dark:placeholder-gray-400"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 text-sm">
          <select 
            className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="rating">Sort: Top Rated</option>
          </select>
          
          <select 
            className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none"
            value={filterLegendary}
            onChange={e => setFilterLegendary(e.target.value)}
          >
            <option value="All">Type: All</option>
            <option value="Legendary">Legendary Only</option>
            <option value="Normal">Normal Only</option>
          </select>

          <select 
            className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none flex-grow"
            value={filterBreed}
            onChange={e => setFilterBreed(e.target.value)}
          >
            <option value="All">Race: All</option>
            {allBreeds.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-6">
        {filteredCatches.length === 0 && <p className="text-gray-500 text-center py-8">No catches found matching filters.</p>}
        {filteredCatches.map((item) => {
          const overall = ((item.rating_face + item.rating_body + item.rating_personality + item.rating_compatibility + (11 - item.rating_red_flags)) / 5).toFixed(1);
          return (
            <div key={item.$id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col">
              <img 
                src={storage.getFileView(BUCKET_ID, item.image_id)} 
                alt={item.name || item.animal_breed}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
              <div className="p-4 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
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
                  <p className="text-sm text-brand-600 dark:text-brand-400 font-medium mb-2">Phone / Instagram: {item.owner_contact}</p>
                )}

                {(item.rating_face || item.rating_personality) && (
                  <div className="mt-2 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg text-sm flex justify-between text-center items-center">
                    <div><div className="text-[10px] text-gray-500 dark:text-gray-400">Face</div><div className="font-bold dark:text-gray-200 text-sm">{item.rating_face || '-'}</div></div>
                    <div><div className="text-[10px] text-gray-500 dark:text-gray-400">Body</div><div className="font-bold dark:text-gray-200 text-sm">{item.rating_body || '-'}</div></div>
                    <div><div className="text-[10px] text-gray-500 dark:text-gray-400">Pers</div><div className="font-bold dark:text-gray-200 text-sm">{item.rating_personality || '-'}</div></div>
                    <div><div className="text-[10px] text-gray-500 dark:text-gray-400">Comp</div><div className="font-bold dark:text-gray-200 text-sm">{item.rating_compatibility || '-'}</div></div>
                    <div><div className="text-[10px] text-red-500 dark:text-red-400">Flags</div><div className="font-bold text-red-600 dark:text-red-400 text-sm">{item.rating_red_flags || '-'}</div></div>
                    <div className="pl-2 border-l border-gray-200 dark:border-gray-600"><div className="text-[10px] text-brand-600 dark:text-brand-400">Avg</div><div className="font-bold text-brand-600 dark:text-brand-400 text-sm">{overall !== 'NaN' ? overall : '-'}</div></div>
                  </div>
                )}

                {item.is_legendary && item.special_characteristics && (
                  <div className="mt-3 bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg border border-yellow-100 dark:border-yellow-700/50">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 italic">"{item.special_characteristics}"</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
