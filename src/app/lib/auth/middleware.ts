import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./jwt";
import { AuthUser } from "../types";

export async function authMiddleware(
  request: NextRequest,
  requiredRole?: string | string[]
): Promise<{ user: AuthUser | null; error?: NextResponse }> {
  try {
    // Get token from cookie
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return {
        user: null,
        error: NextResponse.json(
          { success: false, error: "No authentication token provided" },
          { status: 401 }
        ),
      };
    }

    // Verify token
    const payload = verifyToken(token);

    if (!payload) {
      return {
        user: null,
        error: NextResponse.json(
          { success: false, error: "Invalid or expired token" },
          { status: 401 }
        ),
      };
    }

    const user: AuthUser = {
      id: payload.userId,
      email: payload.email,
      fullName: payload.fullName, // ✅ Added fullName
      role: payload.role as "superadmin" | "resident" | "guard",
      propertyId: payload.propertyId,
    };

    // Check role if required
    if (requiredRole) {
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!roles.includes(user.role)) {
        return {
          user: null,
          error: NextResponse.json(
            { success: false, error: "Insufficient permissions" },
            { status: 403 }
          ),
        };
      }
    }

    return { user };
  } catch (error) {
    console.error("Auth middleware error:", error);
    return {
      user: null,
      error: NextResponse.json(
        { success: false, error: "Authentication failed" },
        { status: 500 }
      ),
    };
  }
}

export function getAuthUser(request: NextRequest): AuthUser | null {
  const token = request.cookies.get("auth-token")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  return {
    id: payload.userId,
    email: payload.email,
    fullName: payload.fullName, // ✅ Added fullName
    role: payload.role as "superadmin" | "resident" | "guard",
    propertyId: payload.propertyId,
  };
}
