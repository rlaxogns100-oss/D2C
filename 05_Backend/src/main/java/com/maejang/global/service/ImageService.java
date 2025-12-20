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

import java.io.IOException;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@Service
public class ImageService {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    @Value("${aws.s3.region}")
    private String region;

    /**
     * 이미지 업로드
     * @param file 업로드할 파일
     * @param folder S3 내 폴더 (예: "menus", "stores")
     * @return 업로드된 파일의 공개 URL
     */
    public String uploadImage(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new CustomException(ErrorCode.EMPTY_FILE);
        }

        // 파일 확장자 검증
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        validateImageExtension(extension);

        // 고유한 파일명 생성
        String fileName = folder + "/" + UUID.randomUUID() + extension;

        try {
            // S3에 업로드
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            // 공개 URL 반환
            return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, fileName);

        } catch (IOException e) {
            log.error("S3 업로드 실패: {}", e.getMessage());
            throw new CustomException(ErrorCode.IMAGE_UPLOAD_FAILED);
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
                    .bucket(bucketName)
                    .key(fileName)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            log.info("S3 이미지 삭제 완료: {}", fileName);

        } catch (Exception e) {
            log.error("S3 삭제 실패: {}", e.getMessage());
            // 삭제 실패는 치명적이지 않으므로 예외를 던지지 않음
        }
    }

    /**
     * 파일 확장자 추출
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }

    /**
     * 이미지 확장자 검증
     */
    private void validateImageExtension(String extension) {
        String ext = extension.toLowerCase();
        if (!ext.equals(".jpg") && !ext.equals(".jpeg") && !ext.equals(".png") && !ext.equals(".gif") && !ext.equals(".webp")) {
            throw new CustomException(ErrorCode.INVALID_IMAGE_FORMAT);
        }
    }

    /**
     * S3 URL에서 파일명 추출
     */
    private String extractFileNameFromUrl(String imageUrl) {
        // https://bucket.s3.region.amazonaws.com/folder/filename.jpg
        // -> folder/filename.jpg
        String[] parts = imageUrl.split(bucketName + ".s3." + region + ".amazonaws.com/");
        if (parts.length == 2) {
            return parts[1];
        }
        throw new IllegalArgumentException("잘못된 S3 URL 형식입니다.");
    }
}

