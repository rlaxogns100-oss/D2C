package com.maejang.global.service;

import com.maejang.global.exception.CustomException;
import com.maejang.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucket;

    @Value("${aws.s3.region}")
    private String region;

    /**
     * 이미지 업로드
     * @param file 업로드할 파일
     * @param directory S3 버킷 내 디렉토리 (예: "menus", "stores", "reviews")
     * @return S3 URL
     */
    public String uploadImage(MultipartFile file, String directory) {
        if (file == null || file.isEmpty()) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }

        // 원본 파일명 가져오기
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }

        // 파일 확장자 검증
        String extension = getFileExtension(originalFilename);
        if (!isImageFile(extension)) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }

        // UUID로 고유한 파일명 생성
        String fileName = directory + "/" + UUID.randomUUID() + extension;

        try {
            // S3에 업로드
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(fileName)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));

            // S3 URL 반환
            return String.format("https://%s.s3.%s.amazonaws.com/%s", bucket, region, fileName);

        } catch (IOException e) {
            log.error("Failed to upload file to S3", e);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        } catch (S3Exception e) {
            log.error("S3 error occurred", e);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 이미지 삭제
     * @param imageUrl S3 URL
     */
    public void deleteImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return;
        }

        try {
            // URL에서 파일 키 추출
            String fileName = extractFileNameFromUrl(imageUrl);

            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucket)
                    .key(fileName)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            log.info("Successfully deleted file from S3: {}", fileName);

        } catch (S3Exception e) {
            log.error("Failed to delete file from S3: {}", imageUrl, e);
            // 삭제 실패해도 예외 던지지 않음 (로그만 남김)
        }
    }

    /**
     * URL에서 파일명 추출
     */
    private String extractFileNameFromUrl(String imageUrl) {
        return imageUrl.substring(imageUrl.indexOf(".com/") + 5);
    }

    /**
     * 파일 확장자 추출
     */
    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf(".");
        if (lastDotIndex == -1) {
            return "";
        }
        return filename.substring(lastDotIndex).toLowerCase();
    }

    /**
     * 이미지 파일 여부 확인
     */
    private boolean isImageFile(String extension) {
        return extension.equals(".jpg") || extension.equals(".jpeg") ||
                extension.equals(".png") || extension.equals(".gif") ||
                extension.equals(".webp");
    }
}

