'use client';
import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser, UserPayload } from '../../lib/api';
import { toast } from 'react-toastify';

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState<UserPayload>({
    fullName: '',
    email: '',
    password: '',
    businessName: '',
    role: 'VA',
    phone: '',
    timeZone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerUser(form);
      router.push('/auth/login');
      toast.success('Registration successful! Please log in.');
    } catch {
      toast.error('Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full my-4 max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-2 text-center">Create your account</h1>
        <p className="text-gray-500 mb-6 text-center">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {['fullName', 'email', 'password', 'businessName', 'phone', 'timeZone'].map((field) => (
            <div key={field}>
              <input
                type={
                  field === 'password'
                    ? 'password'
                    : field === 'email'
                    ? 'email'
                    : 'text'
                }
                name={field}
                placeholder={
                  field === 'fullName'
                    ? 'Full Name'
                    : field === 'businessName'
                    ? 'Business Name'
                    : field === 'timeZone'
                    ? 'Time Zone'
                    : field.charAt(0).toUpperCase() + field.slice(1)
                }
                value={form[field as keyof typeof form]}
                onChange={handleChange}
                required={field !== 'businessName' && field !== 'timeZone'}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                autoComplete={field}
              />
            </div>
          ))}
          <div>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white"
            >
              <option value="VA">VA</option>
              <option value="Team Lead">Team Lead</option>
              <option value="Client">Client</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow transition disabled:opacity-60"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}
