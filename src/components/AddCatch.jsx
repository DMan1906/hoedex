import { useState } from 'react';
import { databases, storage, account, ID, DB_ID, CATCHES_COLLECTION_ID, BUCKET_ID, MILESTONES_COLLECTION_ID } from '../appwrite';
import { Query } from 'appwrite';
import { useNavigate } from 'react-router-dom';

// Lista de rase/specii predefinite (poate fi modificata usor de aici)
const PREDEFINED_BREEDS = [
  'Asian',
  'Ebony',
  'Latino',
  'White',
];

export default function AddCatch() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [modalData, setModalData] = useState({ show: false, title: '', message: '' });
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    animal_breed: '',
    country_of_origin: '',
    special_characteristics: '',
    is_legendary: false,
    legendary_type: '',
    rating_face: 5,
    rating_body: 5,
    rating_personality: 5,
    rating_compatibility: 5,
    rating_red_flags: 5,
    owner_contact: '',
  });

  const overallRating = ((formData.rating_face + formData.rating_body + formData.rating_personality + formData.rating_compatibility + (11 - formData.rating_red_flags)) / 5).toFixed(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please upload a photo first!');
    setIsUploading(true);

    try {
      const user = await account.get();

      const uploadedFile = await storage.createFile(
        BUCKET_ID,
        ID.unique(),
        file
      );

      await databases.createDocument(
        DB_ID,
        CATCHES_COLLECTION_ID,
        ID.unique(),
        {
          user_id: user.$id,
          image_id: uploadedFile.$id,
          name: formData.name,
          age: formData.age !== '' ? parseInt(formData.age) : null,
          animal_breed: formData.animal_breed,
          country_of_origin: formData.country_of_origin,
          special_characteristics: formData.special_characteristics,
          is_legendary: formData.is_legendary,
          legendary_type: formData.is_legendary ? formData.legendary_type : null,
          rating_face: formData.rating_face,
          rating_body: formData.rating_body,
          rating_personality: formData.rating_personality,
          rating_compatibility: formData.rating_compatibility,
          rating_red_flags: formData.rating_red_flags,
          owner_contact: formData.owner_contact,
          created_at: new Date().toISOString(),
        }
      );

      // --- Milestones Logic ---
      const allCatchesReq = await databases.listDocuments(DB_ID, CATCHES_COLLECTION_ID, [
        Query.equal('user_id', user.$id)
      ]);
      const allCatches = allCatchesReq.documents;

      const userMilestonesReq = await databases.listDocuments(DB_ID, MILESTONES_COLLECTION_ID, [
        Query.equal('user_id', user.$id)
      ]);
      const userMilestones = userMilestonesReq.documents.map(m => m.milestone_name);

      const totalCatches = allCatches.length;
      const legendaryCatches = allCatches.filter(c => c.is_legendary).length;
      const distinctBreeds = new Set(allCatches.map(c => c.animal_breed.toLowerCase().trim())).size;

      const milestonesToCheck = [];
      if (totalCatches >= 1) milestonesToCheck.push('first_catch');
      if (totalCatches >= 10) milestonesToCheck.push('10_catches');
      if (totalCatches >= 100) milestonesToCheck.push('100_catches');
      if (totalCatches >= 1000) milestonesToCheck.push('1000_catches');

      if (legendaryCatches >= 1) milestonesToCheck.push('first_legendary');
      if (legendaryCatches >= 10) milestonesToCheck.push('10_legendaries');

      if (distinctBreeds >= 5) milestonesToCheck.push('5_breeds');
      if (distinctBreeds >= 10) milestonesToCheck.push('10_breeds');
      if (distinctBreeds >= 25) milestonesToCheck.push('25_breeds');

      const newMilestones = milestonesToCheck.filter(m => !userMilestones.includes(m));

      let alertMessage = 'Catch added successfully!';

      // Update user's catches_count in profiles
      try {
        const userProfileReq = await databases.listDocuments(DB_ID, 'profiles', [
          Query.equal('user_id', user.$id)
        ]);
        if (userProfileReq.documents.length > 0) {
          const profile = userProfileReq.documents[0];
          await databases.updateDocument(DB_ID, 'profiles', profile.$id, {
            catches_count: profile.catches_count + 1
          });
        }
      } catch (err) {
        console.error('Failed to update catches_count', err);
      }

      if (newMilestones.length > 0) {
        for (const m of newMilestones) {
          await databases.createDocument(DB_ID, MILESTONES_COLLECTION_ID, ID.unique(), {
            user_id: user.$id,
            milestone_name: m,
            unlocked_at: new Date().toISOString()
          });
        }
        alertMessage += `\n\n🎉 You unlocked ${newMilestones.length} new badge(s)! Check your Milestones page.`;
      }

      setModalData({
        show: true,
        title: newMilestones.length > 0 ? 'Achievement Unlocked!' : 'Success!',
        message: alertMessage
      });
      // navigate is now handled by closing the modal
    } catch (error) {
      console.error('Error adding catch:', error);
      setModalData({
        show: true,
        title: 'Error',
        message: error.message || 'Failed to add catch.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseModal = () => {
    const isError = modalData.title === 'Error';
    setModalData({ show: false, title: '', message: '' });
    if (!isError) {
      navigate('/my-catches');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm mt-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">New Catch</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-bold
              file:bg-brand-50 file:text-brand-700
              dark:file:bg-gray-700 dark:file:text-brand-300
              hover:file:bg-brand-100 dark:hover:file:bg-gray-600
              border border-gray-300 dark:border-gray-600 rounded-md
              bg-white dark:bg-gray-700
              cursor-pointer transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Animal Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="Ex: Rex, Bella"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Age (years)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="Ex: 22"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Race</label>
          <input
            type="text"
            list="breeds-list"
            value={formData.animal_breed}
            onChange={(e) => setFormData({ ...formData, animal_breed: e.target.value })}
            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="Selectează sau scrie o rasă nouă"
            required
          />
          <datalist id="breeds-list">
            {PREDEFINED_BREEDS.map(breed => (
              <option key={breed} value={breed} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Country of Origin</label>
          <input
            type="text"
            value={formData.country_of_origin}
            onChange={(e) => setFormData({ ...formData, country_of_origin: e.target.value })}
            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="legendary"
            checked={formData.is_legendary}
            onChange={(e) => setFormData({ ...formData, is_legendary: e.target.checked })}
            className="h-4 w-4 text-brand-600 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-brand-500"
          />
          <label htmlFor="legendary" className="text-sm font-medium text-gray-700 dark:text-gray-300">Is Legendary?</label>
        </div>

        {formData.is_legendary && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Legendary Type</label>
              <input
                type="text"
                value={formData.legendary_type}
                onChange={(e) => setFormData({ ...formData, legendary_type: e.target.value })}
                className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Special Characteristics</label>
              <textarea
                value={formData.special_characteristics}
                onChange={(e) => setFormData({ ...formData, special_characteristics: e.target.value })}
                className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                rows="2"
              />
            </div>
          </>
        )}

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-200 mb-2">Stats (1-10)</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Face</label>
              <input 
                type="number" min="1" max="10" 
                value={formData.rating_face} 
                onChange={e => setFormData({...formData, rating_face: parseInt(e.target.value) || 1})}
                className="w-20 p-1 border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Body</label>
              <input 
                type="number" min="1" max="10" 
                value={formData.rating_body} 
                onChange={e => setFormData({...formData, rating_body: parseInt(e.target.value) || 1})}
                className="w-20 p-1 border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Personality</label>
              <input 
                type="number" min="1" max="10" 
                value={formData.rating_personality} 
                onChange={e => setFormData({...formData, rating_personality: parseInt(e.target.value) || 1})}
                className="w-20 p-1 border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Compatibility</label>
              <input 
                type="number" min="1" max="10" 
                value={formData.rating_compatibility} 
                onChange={e => setFormData({...formData, rating_compatibility: parseInt(e.target.value) || 1})}
                className="w-20 p-1 border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-red-500 dark:text-red-400 font-bold">Red Flags</label>
              <input 
                type="number" min="1" max="10" 
                value={formData.rating_red_flags} 
                onChange={e => setFormData({...formData, rating_red_flags: parseInt(e.target.value) || 1})}
                className="w-20 p-1 border border-red-300 dark:border-red-800 rounded text-center bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold"
              />
            </div>
            <div className="pt-2 flex justify-between items-center text-brand-600 dark:text-brand-400 font-bold">
              <span>Overall Rating</span>
              <span className="text-xl">{overallRating} / 10</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone / Instagram</label>
          <input
            type="text"
            value={formData.owner_contact}
            onChange={(e) => setFormData({ ...formData, owner_contact: e.target.value })}
            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="@username or phone (optional)"
          />
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className="w-full bg-brand-600 text-white p-3 rounded-lg font-semibold hover:bg-brand-500 disabled:opacity-50"
        >
          {isUploading ? 'Uploading...' : 'Log Catch'}
        </button>
      </form>

      {/* Modal */}
      {modalData.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 transform transition-all duration-300 scale-100 border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-200 mb-2">{modalData.title}</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-6">{modalData.message}</p>
            <button 
              onClick={handleCloseModal}
              className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl hover:bg-brand-700 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
