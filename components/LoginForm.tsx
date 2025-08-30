import React, { useState } from 'react';
import { useAuthStore } from '../hooks/useAuthStore';

const LoginForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const login = useAuthStore(state => state.login);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simple authentication - you can enhance this later
        const validCredentials = [
            { username: 'admin', password: 'lkim2025' },
            { username: 'urusetia', password: 'damaji2025' },
            { username: 'fadirule', password: 'admin123' }
        ];

        const isValid = validCredentials.some(
            cred => cred.username === username && cred.password === password
        );

        setTimeout(() => {
            if (isValid) {
                login(username);
            } else {
                setError('Username atau password tidak betul');
            }
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-navy flex items-center justify-center p-4">
            <div className="bg-light-navy p-8 rounded-lg shadow-2xl w-full max-w-md border border-lightest-navy">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gold mb-2">Admin Login</h1>
                    <p className="text-light-slate">Sistem Pengurusan Dam Aji</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-lightest-slate mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 bg-navy border border-lightest-navy rounded-md text-lightest-slate focus:outline-none focus:ring-2 focus:ring-gold"
                            placeholder="Masukkan username"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-lightest-slate mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-navy border border-lightest-navy rounded-md text-lightest-slate focus:outline-none focus:ring-2 focus:ring-gold"
                            placeholder="Masukkan password"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gold hover:bg-yellow-500 text-navy font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-xs text-slate">
                        © 2025 Lembaga Kemajuan Ikan Malaysia (LKIM)
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
