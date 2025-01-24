package com.ssafy.peachptich.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name="chat_history")
@Getter
@ToString
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class ChatHistory {
    @Id
    @Column(name="history_id", nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long historyId;

    @Column(name="user1_id", nullable = false)
    private Long user1Id;

    @Column(name="user2_id")
    private Long user2Id;

    @Column(name="keyword1_id", nullable = false)
    private Long keyword1Id;

    @Column(name="keyword2_id")
    private Long keyword2Id;

    @CreationTimestamp
    @Column(name="created_at")
    private LocalDateTime createdAt;

    @Column(name="status", nullable = false)
    @ColumnDefault("1")
    private boolean status;

    @Column(name="user1_name", nullable = false, columnDefinition = "varchar(40)")
    private String user1Name;

    @Column(name="user2_name", columnDefinition = "varchar(40)")
    private String user2Name;

    @Column(name="user1_feedback", columnDefinition = "varchar(20)")
    private String user1Feedback;

    @Column(name="user2_feedback", columnDefinition = "varchar(20)")
    private String user2Feedback;

    /**
     * 1:1 대화
     * @param user1Id
     * @param user2Id
     * @param keyword1Id
     * @param keyword2Id
     * @param createdAt
     * @param status
     * @param user1Name
     * @param user2Name
     * @param user1Feedback
     * @param user2Feedback
     */
    @Builder
    public ChatHistory(Long user1Id, Long user2Id, Long keyword1Id, Long keyword2Id, LocalDateTime createdAt, boolean status, String user1Name, String user2Name, String user1Feedback, String user2Feedback){
        this.user1Id=user1Id;
        this.user2Id=user2Id;
        this.keyword1Id=keyword1Id;
        this.keyword2Id=keyword2Id;
        this.createdAt=createdAt;
        this.status=status;
        this.user1Name=user1Name;
        this.user2Name=user2Name;
        this.user1Feedback=user1Feedback;
        this.user2Feedback=user2Feedback;
    }

    /**
     * AI와 대화
     * @param user1Id
     * @param keyword1Id
     * @param createdAt
     * @param status
     * @param user1Name
     */
    @Builder
    public ChatHistory(Long user1Id, Long keyword1Id, LocalDateTime createdAt, boolean status, String user1Name){
        this.user1Id=user1Id;
        this.keyword1Id=keyword1Id;
        this.createdAt=createdAt;
        this.status=status;
        this.user1Name=user1Name;
    }

}