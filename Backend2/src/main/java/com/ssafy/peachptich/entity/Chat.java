package com.ssafy.peachptich.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name="chat")
@Getter
//@ToString
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Chat {
    @Id
    @Column(name="chat_id", nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long chatId;

    @Column(name="created_at")
    private LocalDateTime createdAt;

    @Column(name="content", columnDefinition = "varchar(500)")
    private String content;

    @Column(name="user_id", nullable = false)
    private Long userId;

    // 합치기 전 nullable = false 추가
    @ManyToOne
    @JoinColumn(name="history_id")
    private ChatHistory chatHistory;


    @Builder
    public Chat(LocalDateTime createdAt, String content, Long userId, ChatHistory chatHistory) {
        this.createdAt=createdAt;
        this.content=content;
        this.userId=userId;
        this.chatHistory=chatHistory;
    }
}
