package com.maejang.global.controller;

import com.maejang.global.response.JSONResponse;
import com.maejang.global.service.S3Service;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Tag(name = "Image", description = "이미지 업로드 API")
@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {

    private final S3Service s3Service;

    @Operation(summary = "이미지 업로드", description = "이미지를 S3에 업로드하고 URL을 반환합니다.")
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<JSONResponse<Map<String, String>>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type // "menu", "store", "review" 등
    ) {
        String imageUrl = s3Service.uploadImage(file, type);
        return ResponseEntity.ok(JSONResponse.success(Map.of("imageUrl", imageUrl)));
    }

    @Operation(summary = "이미지 삭제", description = "S3에서 이미지를 삭제합니다.")
    @DeleteMapping
    public ResponseEntity<JSONResponse<Void>> deleteImage(@RequestParam("imageUrl") String imageUrl) {
        s3Service.deleteImage(imageUrl);
        return ResponseEntity.ok(JSONResponse.success(null));
    }
}

