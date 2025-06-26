'use client';
// This file is a client component for user signup functionality in a Next.js application.
import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser, UserPayload } from '../../lib/api';

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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await registerUser(form);
      router.push('/auth/login');
    } catch {
      alert('Signup failed');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl mb-4">Sign Up</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        {['fullName', 'email', 'password', 'businessName', 'phone', 'timeZone'].map((field) => (
          <input
            key={field}
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
            className="w-full p-2 border rounded"
          />
        ))}
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="VA">VA</option>
          <option value="Team Lead">Team Lead</option>
          <option value="Client">Client</option>
        </select>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
          Register
        </button>
      </form>
    </div>
  );
}
