import { Student, StudentStatus, StudentStage } from '../types';

const BASE_URL = '/api/students';

export interface CreateStudentInput {
    name: string;
    phone?: string;
    age?: number;
    tags?: string[];
    status?: StudentStatus;
    pauseTime?: string;
    currentTask?: string;
    stage?: StudentStage;
    avatar?: string;
}

export async function getStudents(search?: string): Promise<Student[]> {
    const params = new URLSearchParams();
    if (search && search.trim()) {
        params.set('search', search.trim());
    }
    const url = `${BASE_URL}${params.toString() ? '?' + params.toString() : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || 'Failed to fetch students');
    }
    return res.json();
}

export async function createStudent(input: CreateStudentInput): Promise<Student> {
    const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || 'Failed to create student');
    }
    return res.json();
}

export async function updateStudent(id: string, input: Partial<CreateStudentInput>): Promise<Student> {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || 'Failed to update student');
    }
    return res.json();
}

export async function deleteStudent(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || 'Failed to delete student');
    }
}
