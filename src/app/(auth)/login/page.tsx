'use client';

import React from 'react';
import AuthLayout from '@/app/components/layout/AuthLayout';
import LoginForm from '@/app/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}