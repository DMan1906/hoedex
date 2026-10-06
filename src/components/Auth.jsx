import { useState } from 'react';
import { account, databases, DB_ID, ID } from '../appwrite';

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await account.createEmailPasswordSession(email, password);
      } else {
        const user = await account.create(ID.unique(), email, password, name);
        await account.createEmailPasswordSession(email, password);
        // Create profile document
        await databases.createDocument(DB_ID, 'profiles', ID.unique(), {
          user_id: user.$id,
          name: name,
          catches_count: 0,
          created_at: new Date().toISOString()
        });
      }
      onLogin();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Hoedex Logo" className="w-24 h-24 mb-4 dark:invert dark:mix-blend-screen" />
          <h2 className="text-3xl font-extrabold text-center text-gray-900 dark:text-gray-100">
            Welcome to <span className="text-brand-500 dark:text-brand-400">Hoedex</span>
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500"
                required={!isLogin}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500"
              required
              minLength="8"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-brand-600 text-white p-3 rounded-lg font-bold hover:bg-brand-500 transition-colors"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-brand-600 font-semibold hover:underline"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}
