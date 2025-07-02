"use client";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";

// fetch user data from API
const fetchUser = async () => {
  const response = await axiosInstance.get("/api/logged-in-user");
  return response.data.user;
};

const useUser = () => {
  const {
    data: user,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
  console.log(user);

  return { user: user as any, isLoading: isPending, isError, refetch };
};

export default useUser;
