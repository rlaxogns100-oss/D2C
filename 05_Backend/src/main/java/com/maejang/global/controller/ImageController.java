package com.maejang.global.controller;

import com.maejang.global.response.JSONResponse;
import com.maejang.global.service.ImageService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/images")
public class ImageController {

    private final ImageService imageService;

    @Operation(summary = "이미지 업로드", description = "이미지 파일을 S3에 업로드하고 URL을 반환합니다.")
    @PostMapping("/upload")
    public ResponseEntity<JSONResponse<Map<String, String>>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "menus") String folder
    ) {
        String imageUrl = imageService.uploadImage(file, folder);
        return ResponseEntity.ok(JSONResponse.success(Map.of("imageUrl", imageUrl)));
    }

    @Operation(summary = "이미지 삭제", description = "S3에서 이미지를 삭제합니다.")
    @DeleteMapping
    public ResponseEntity<JSONResponse<Void>> deleteImage(@RequestParam("url") String imageUrl) {
        imageService.deleteImage(imageUrl);
        return ResponseEntity.ok(JSONResponse.success(null));
    }
}
