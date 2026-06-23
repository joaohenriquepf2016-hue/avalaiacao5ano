import { Student, FirebaseConfig } from "./types";
import { INITIAL_STUDENTS } from "./initialData";

const STORAGE_KEY_CONFIG = "spabb_firebase_config";
const STORAGE_KEY_STUDENTS = "spabb_students_local";

// Load Firebase configuration from LocalStorage
export function getFirebaseConfig(): FirebaseConfig | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY_CONFIG);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Failed to load Firebase config", e);
    return null;
  }
}

// Save Firebase configuration to LocalStorage
export function saveFirebaseConfig(config: FirebaseConfig | null) {
  if (config) {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } else {
    localStorage.removeItem(STORAGE_KEY_CONFIG);
  }
}

// Format the Realtime Database URL to ensure it has a proper structure and ends without trailing slash
function formatDbUrl(url: string): string {
  let cleanUrl = url.trim();
  if (cleanUrl.endsWith("/")) {
    cleanUrl = cleanUrl.slice(0, -1);
  }
  if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
    cleanUrl = "https://" + cleanUrl;
  }
  return cleanUrl;
}

// Fetch students from Firebase Realtime Database or fallback to LocalStorage/Initial Data
export async function fetchStudents(): Promise<{ students: Student[]; source: "firebase" | "local" | "initial" }> {
  const config = getFirebaseConfig();
  
  if (config && config.databaseURL) {
    try {
      const url = `${formatDbUrl(config.databaseURL)}/students.json${config.apiKey ? `?auth=${config.apiKey}` : ""}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        if (data) {
          // Firebase Realtime DB might return either an array or an object keyed by ID
          const studentList: Student[] = Array.isArray(data)
            ? data.filter(Boolean)
            : Object.keys(data).map(key => ({ ...data[key], id: key }));
          
          if (studentList.length > 0) {
            // Cache locally as well
            localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(studentList));
            return { students: studentList, source: "firebase" };
          }
        }
      }
    } catch (error) {
      console.error("Firebase fetch failed, falling back to local storage:", error);
    }
  }

  // Fallback to local storage cache
  try {
    const cached = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (cached) {
      return { students: JSON.parse(cached), source: "local" };
    }
  } catch (e) {
    console.error("Local storage read failed", e);
  }

  // Fallback to initial default data
  return { students: INITIAL_STUDENTS, source: "initial" };
}

// Save all students to Firebase or LocalStorage
export async function saveStudents(students: Student[]): Promise<boolean> {
  // Always save locally first
  localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));

  const config = getFirebaseConfig();
  if (config && config.databaseURL) {
    try {
      const url = `${formatDbUrl(config.databaseURL)}/students.json${config.apiKey ? `?auth=${config.apiKey}` : ""}`;
      
      // We convert student array into a key-value map to preserve IDs perfectly in Realtime Database
      const dataMap: { [id: string]: Student } = {};
      students.forEach(student => {
        dataMap[student.id] = student;
      });

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dataMap)
      });
      
      return response.ok;
    } catch (error) {
      console.error("Firebase save failed:", error);
      return false;
    }
  }

  return true; // Saved to local storage successfully
}

// Check if Firebase is configured
export function isFirebaseConnected(): boolean {
  const config = getFirebaseConfig();
  return !!(config && config.databaseURL);
}
