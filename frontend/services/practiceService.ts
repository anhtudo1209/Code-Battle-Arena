import { post, get } from "./httpClient";

export interface Exercise {
    id: string;
    title: string;
    description?: string;
    content?: string;
    difficulty: string;
    tags?: string[];
    timeLimit?: number;
    memoryLimit?: string;
    starterCode?: string;
    editable_start?: number;
    editable_end?: number;
}

export interface SubmissionResult {
    success: boolean;
    submissionId: number;
    jobId?: string;
    message?: string;
}

export interface Submission {
    id: number;
    status: string;
    compilation_success?: boolean;
    compilation_error?: string;
    test_results?: any[];
}

// Get all exercises
export function getExercises(): Promise<{ exercises: Exercise[] }> {
    return get("/practice/exercises");
}

// Get exercises filtered by difficulty
export function getExercisesByDifficulty(difficulty: string): Promise<{ exercises: Exercise[] }> {
    return get(`/practice/exercises?difficulty=${difficulty}`);
}

// Get single exercise details
export function getExercise(id: string): Promise<Exercise> {
    return get(`/practice/exercises/${id}`);
}

// Get random exercise
export function getRandomExercise(difficulty?: string): Promise<{ id: string }> {
    const query = difficulty ? `?difficulty=${difficulty}` : '';
    return get(`/practice/exercises/random${query}`);
}

// Submit code for practice
export function submitCode(code: string, exerciseId: string): Promise<SubmissionResult> {
    return post("/practice/submit", { code, exerciseId });
}

// Get submission status (for polling)
export function getSubmission(submissionId: number): Promise<{ submission: Submission }> {
    return get(`/practice/submissions/${submissionId}`);
}

// Get submission history
export function getSubmissions(): Promise<{ submissions: Submission[] }> {
    return get("/practice/submissions");
}

export default {
    getExercises,
    getExercisesByDifficulty,
    getExercise,
    getRandomExercise,
    submitCode,
    getSubmission,
    getSubmissions
};
