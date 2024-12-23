'use client';

import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { ActionModals } from '@/components/manage-users/ActionModals';
import ManageUsersSkeleton from '@/components/manage-users/ManageUsersSkeleton';
import { UsersTable } from '@/components/manage-users/users-table/UsersTable';
import { useAuthStore } from '@/stores/useAuthStore';
import { useManageUsersStore } from '@/stores/useManageUsersStore';

const ManageUsersRepositoryContent = () => {
  const selectedUser = useManageUsersStore.use.selectedUser();

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
  const user = useAuthStore.use.user();
  if (user && user.role !== 'Admin') {
    return notFound();
  }

  return (
    <Suspense fallback={<ManageUsersSkeleton />}>
      <ManageUsersRepositoryContent />
    </Suspense>
  );
};

export default UsersRepository;
