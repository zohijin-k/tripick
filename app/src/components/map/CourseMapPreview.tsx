import React, { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import type { Spot } from '../../types/course';
import {
  normalizeCoordinates,
  hasValidCoordinates,
} from '../../utils/mapProjection';

interface Props {
  spots: Spot[];
  visitedSpotIds?: string[];
  activeSpotId?: string | null;
  userLocation?: { lat: number; lng: number } | null;
  height?: number;
}

type PercentValue = `${number}%`;

function Marker({
  label,
  state,
  left,
  top,
}: {
  label: string;
  state: 'visited' | 'active' | 'upcoming';
  left: PercentValue;
  top: PercentValue;
}) {
  const markerStyles = [
    styles.marker,
    state === 'visited' && styles.markerVisited,
    state === 'active' && styles.markerActive,
  ];

  return (
    <View style={[styles.markerWrap, { left, top }]}>
      <View style={markerStyles}>
        <Text style={styles.markerText}>{state === 'visited' ? '✓' : label}</Text>
      </View>
    </View>
  );
}

export function CourseMapPreview({
  spots,
  visitedSpotIds = [],
  activeSpotId = null,
  userLocation = null,
  height = 220,
}: Props) {
  const [layoutSize, setLayoutSize] = useState({ width: 0, height: 0 });
  const { spotPoints, userPoint } = useMemo(
    () => normalizeCoordinates(spots, userLocation),
    [spots, userLocation],
  );

  const validSpots = useMemo(
    () => spots.filter((spot): spot is Spot & { lat: number; lng: number } => hasValidCoordinates(spot)),
    [spots],
  );

  const hasRenderableSpots = spotPoints.length > 0;

  if (!hasRenderableSpots) {
    return (
      <View style={styles.card}>
        <View style={[styles.mapFrame, styles.emptyFrame, { height }]}>
          <Text style={styles.emptyTitle}>표시할 위치 정보가 없습니다</Text>
          <Text style={styles.emptyBody}>좌표가 있는 장소가 추가되면 코스 경로를 미리 볼 수 있어요.</Text>
        </View>
      </View>
    );
  }

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height: nextHeight } = event.nativeEvent.layout;
    setLayoutSize((prev) => (
      prev.width === width && prev.height === nextHeight
        ? prev
        : { width, height: nextHeight }
    ));
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Map Preview</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{spotPoints.length}개 지점</Text>
        </View>
      </View>

      <View style={[styles.mapFrame, { height }]} onLayout={handleLayout}>
        <View style={styles.gridOverlay}>
          {[20, 40, 60, 80].map((value) => (
            <React.Fragment key={value}>
              <View style={[styles.gridLineHorizontal, { top: `${value}%` }]} />
              <View style={[styles.gridLineVertical, { left: `${value}%` }]} />
            </React.Fragment>
          ))}
        </View>

        {layoutSize.width > 0 && layoutSize.height > 0 && spotPoints.slice(1).map((point, index) => {
          const prevPoint = spotPoints[index];
          const startX = (prevPoint.x / 100) * layoutSize.width;
          const startY = (prevPoint.y / 100) * layoutSize.height;
          const endX = (point.x / 100) * layoutSize.width;
          const endY = (point.y / 100) * layoutSize.height;
          const dx = endX - startX;
          const dy = endY - startY;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);
          const segmentVisited =
            visitedSpotIds.includes(validSpots[index].id) &&
            visitedSpotIds.includes(validSpots[index + 1].id);

          return (
            <View
              key={`${prevPoint.id}-${point.id}`}
              style={[
                styles.pathSegment,
                segmentVisited && styles.pathSegmentVisited,
                {
                  width: length,
                  left: startX,
                  top: startY,
                  transform: [{ rotateZ: `${angle}rad` }],
                },
              ]}
            />
          );
        })}

        {spotPoints.map((point, index) => {
          const spotId = validSpots[index].id;
          const isVisited = visitedSpotIds.includes(spotId);
          const isActive = spotId === activeSpotId && !isVisited;
          const state = isVisited ? 'visited' : isActive ? 'active' : 'upcoming';

          return (
            <Marker
              key={spotId}
              label={String(index + 1)}
              state={state}
              left={`${point.x}%` as PercentValue}
              top={`${point.y}%` as PercentValue}
            />
          );
        })}

        {userPoint && (
          <View
            style={[
              styles.userWrap,
              {
                left: `${userPoint.x}%` as PercentValue,
                top: `${userPoint.y}%` as PercentValue,
              },
            ]}
          >
            <View style={styles.userPulse} />
            <View style={styles.userMarker}>
              <Text style={styles.userMarkerText}>내</Text>
            </View>
          </View>
        )}

        <View style={styles.watermark}>
          <Text style={styles.watermarkText}>TRIPICK Route</Text>
        </View>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendUpcoming]} />
          <Text style={styles.legendText}>예정</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendActive]} />
          <Text style={styles.legendText}>현재 목적지</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendVisited]} />
          <Text style={styles.legendText}>방문 완료</Text>
        </View>
        {userPoint && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendUser]} />
            <Text style={styles.legendText}>내 위치</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#13315c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#13315c',
  },
  badge: {
    backgroundColor: '#e6f4f1',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f8b6d',
  },
  mapFrame: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 14,
    backgroundColor: '#eef6fb',
    borderWidth: 1,
    borderColor: '#d7e6f1',
  },
  emptyFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#f4f8fb',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#5c6b7a',
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: 12,
    color: '#8a9db0',
    textAlign: 'center',
    lineHeight: 18,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#d5e4ee',
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#d5e4ee',
  },
  pathSegment: {
    position: 'absolute',
    height: 3,
    marginTop: -1.5,
    borderRadius: 999,
    backgroundColor: '#90a4b8',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#90a4b8',
    opacity: 0.75,
  },
  pathSegmentVisited: {
    backgroundColor: '#0f8b6d',
    borderColor: '#0f8b6d',
  },
  markerWrap: {
    position: 'absolute',
    marginLeft: -16,
    marginTop: -16,
  },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#13315c',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#13315c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  markerVisited: {
    backgroundColor: '#0f8b6d',
  },
  markerActive: {
    backgroundColor: '#16a34a',
    transform: [{ scale: 1.08 }],
  },
  markerText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  userWrap: {
    position: 'absolute',
    marginLeft: -14,
    marginTop: -14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userPulse: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(29, 78, 216, 0.18)',
  },
  userMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1d4ed8',
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  watermark: {
    position: 'absolute',
    right: 10,
    bottom: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  watermarkText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#648197',
    letterSpacing: 0.3,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendUpcoming: {
    backgroundColor: '#13315c',
  },
  legendActive: {
    backgroundColor: '#16a34a',
  },
  legendVisited: {
    backgroundColor: '#0f8b6d',
  },
  legendUser: {
    backgroundColor: '#1d4ed8',
  },
  legendText: {
    fontSize: 11,
    color: '#5c6b7a',
    fontWeight: '600',
  },
});
