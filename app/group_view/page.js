"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ViewGroup from '../../components/pages/view_groups/ViewGroup';

export default function GroupViewPage() {
    const searchParams = useSearchParams();
    const groupId = searchParams.get('id') || 'roommates'; // Default to 'roommates' for now

    return (
        <div className="container mx-auto px-4 py-8">
            <ViewGroup groupId={groupId} />
        </div>
    );
}