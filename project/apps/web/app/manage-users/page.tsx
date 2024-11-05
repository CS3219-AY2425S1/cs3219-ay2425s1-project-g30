'use client';

import { Suspense } from 'react';

import { ActionModals } from '@/components/manage-users/ActionModals';
import ManageUsersSkeleton from '@/components/manage-users/ManageUsersSkeleton';
import { UsersTable } from '@/components/manage-users/users-table/UsersTable';
import { useManageUsersStore } from '@/stores/useManageUsersStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { notFound } from 'next/navigation';

const ManageUsersRepositoryContent = () => {
  const user = useAuthStore.use.user();
  const selectedUser = useManageUsersStore.use.selectedUser();
  if (user && user.role !== 'Admin') {
    return notFound();
  }

  return (
    <div className="container p-6 mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between my-4">
        <h1 className="text-xl font-semibold">Users Repository</h1>
      </div>

      {/* Table */}
      <UsersTable />

      {selectedUser && <ActionModals user={selectedUser} />}
    </div>
  );
};

const UsersRepository = () => {
  return (
    <Suspense fallback={<ManageUsersSkeleton />}>
      <ManageUsersRepositoryContent />
    </Suspense>
  );
};

export default UsersRepository;
