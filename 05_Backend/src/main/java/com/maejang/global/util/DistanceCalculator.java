package com.maejang.global.util;

/**
 * 두 좌표 간의 거리를 계산하는 유틸리티 클래스
 */
public class DistanceCalculator {

    private static final double EARTH_RADIUS_KM = 6371.0; // 지구 반경 (km)

    /**
     * Haversine formula를 사용하여 두 좌표 간의 직선 거리를 계산
     * @param lat1 시작점 위도
     * @param lon1 시작점 경도
     * @param lat2 도착점 위도
     * @param lon2 도착점 경도
     * @return 두 지점 간의 거리 (km)
     */
    public static double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        // 위도와 경도를 라디안으로 변환
        double lat1Rad = Math.toRadians(lat1);
        double lat2Rad = Math.toRadians(lat2);
        double deltaLatRad = Math.toRadians(lat2 - lat1);
        double deltaLonRad = Math.toRadians(lon2 - lon1);

        // Haversine formula
        double a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2)
                + Math.cos(lat1Rad) * Math.cos(lat2Rad)
                * Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c;
    }

    /**
     * 배달 가능한 거리인지 확인
     * @param storeLat 가게 위도
     * @param storeLon 가게 경도
     * @param deliveryLat 배달지 위도
     * @param deliveryLon 배달지 경도
     * @param deliveryRadius 배달 반경 (km)
     * @return 배달 가능 여부
     */
    public static boolean isWithinDeliveryRange(double storeLat, double storeLon,
                                                 double deliveryLat, double deliveryLon,
                                                 double deliveryRadius) {
        double distance = calculateDistance(storeLat, storeLon, deliveryLat, deliveryLon);
        return distance <= deliveryRadius;
    }
}

