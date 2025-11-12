import { NextResponse } from 'next/server';
import { auth } from '@cronkwaters/auth';

import { createClient } from '../../../lib/supabase/server';

export async function POST(request: Request) {
  try {
    // Use NextAuth for authentication
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = session.user;
    
    // Use Supabase ONLY for storage
    const supabase = await createClient();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const _projectId = formData.get('projectId') as string; // TODO: Use for asset tracking

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id || 'anonymous'}/${Date.now()}.${fileExt}`;
    const filePath = `audio/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('audio')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('audio').getPublicUrl(filePath);

    // Save asset record using Prisma (through NextAuth's unified system)
    // TODO: Replace with Prisma client call
    // const asset = await prisma.asset.create({
    //   data: {
    //     projectId,
    //     name: file.name,
    //     storagePath: filePath,
    //     mimeType: file.type,
    //     bytes: file.size,
    //     createdById: user.id || '',
    //   }
    // });

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

