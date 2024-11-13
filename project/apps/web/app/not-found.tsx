'use client';

import Error from 'next/error';

export default function Page() {
  return <Error statusCode={404} withDarkMode={false} />;
}
