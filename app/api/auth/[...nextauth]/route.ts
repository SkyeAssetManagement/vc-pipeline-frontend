import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Simple demo authentication - in production, use a proper database
        const demoUsers = [
          { id: '1', email: 'admin@veronacapital.com', password: 'admin123', name: 'Admin User', role: 'admin' },
          { id: '2', email: 'analyst@veronacapital.com', password: 'analyst123', name: 'Portfolio Analyst', role: 'analyst' },
          { id: '3', email: 'viewer@veronacapital.com', password: 'viewer123', name: 'Read Only User', role: 'viewer' }
        ];

        const user = demoUsers.find(
          u => u.email === credentials?.email && u.password === credentials?.password
        );

        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          };
        }

        return null;
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-here'
});

export { handler as GET, handler as POST };
