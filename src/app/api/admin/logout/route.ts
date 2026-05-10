import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = '/admin/login';
  const res = NextResponse.redirect(url);
  res.cookies.set('admin_token', '', { maxAge: 0, path: '/' });
  return res;
}
