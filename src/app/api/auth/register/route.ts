import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken, setTokenCookie, hashPassword } from '@/lib/auth';
import { validateEmail, validatePasswordStrength, formatValidationError } from '@/lib/validator';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const identifier = getClientIdentifier(req);
    
    const rateLimit = checkRateLimit(`register:${identifier}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString() } }
      );
    }
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    
    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    
    const passwordValidation = validatePasswordStrength(password, true);
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: formatValidationError(passwordValidation.errors) }, { status: 400 });
    }
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }
    
    const hashedPassword = await hashPassword(password);
    
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
      select: { id: true, email: true, createdAt: true }
    });
    
    const token = generateToken({ userId: user.id, email: user.email });
    await setTokenCookie(token);
    
    return NextResponse.json({ message: 'User registered successfully', user }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}