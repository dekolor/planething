import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const FLIGHTS_PER_PAGE = 10;

type FlightFilter = "all" | "ontime" | "delayed";

export function useInfiniteFlights(filter: FlightFilter = "all") {
  const [allFlights, setAllFlights] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreFlights, setHasMoreFlights] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);

  const { page, isDone, continueCursor } = useQuery(api.myFunctions.listFlights, {
    paginationOpts: {
      numItems: FLIGHTS_PER_PAGE,
      cursor,
    },
    filter: filter === "all" ? undefined : filter,
  }) ?? { page: [], isDone: true, continueCursor: null };

  // Reset flights when filter changes
  useEffect(() => {
    setAllFlights([]);
    setCursor(null);
    setIsLoadingMore(false);
    setHasMoreFlights(true);
  }, [filter]);

  useEffect(() => {
    if (page && page.length > 0) {
      if (cursor === null) {
        // First load
        setAllFlights(page);
      } else {
        // Append new flights
        setAllFlights(prev => [...prev, ...page]);
      }
      setIsLoadingMore(false);
    }
    
    setHasMoreFlights(!isDone);
  }, [page, isDone, cursor]);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMoreFlights && continueCursor) {
      setIsLoadingMore(true);
      setCursor(continueCursor);
    }
  }, [isLoadingMore, hasMoreFlights, continueCursor]);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreFlights && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, hasMoreFlights, isLoadingMore]);

  return {
    flights: allFlights,
    isLoadingMore,
    hasMoreFlights,
    loadingRef,
    isInitialLoading: allFlights.length === 0 && page === undefined,
  };
}