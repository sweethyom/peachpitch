package com.ssafy.peachptich.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Table(name="chat_report")
@Getter
@ToString
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class ChatReport {
    @Id
    @Column(name = "report_id", nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY) //GenerationType.IDENTITY: auto_increment
    private Long reportId;

    @Column(name = "chat_time", nullable = false)
    @ColumnDefault("3")
    private Integer chatTime;

    //    @Column(name = "silence_time", nullable = false)
    //    @ColumnDefault("0")
    //    private Integer silenceTime;

    @Column(name = "pros", columnDefinition = "varchar(300)")
    private String pros;

    @Column(name = "cons", columnDefinition = "varchar(300)")
    private String cons;

    @Column(name = "summary", columnDefinition = "varchar(300)")
    private String summary;

    @ManyToOne
    @JoinColumn(name="user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "history_id")
    private ChatHistory chatHistory;

    /**
     * 생성은 장고에서 하지만 테스트 용으로 남겨둠
     * @param chatTime
     * @param pros
     * @param cons
     * @param summary
     * @param user
     * @param chatHistory
     */
    @Builder
    public ChatReport(Integer chatTime, String pros, String cons, String summary, User user, ChatHistory chatHistory) {
        this.chatTime = chatTime;
        this.pros = pros;
        this.cons = cons;
        this.summary = summary;
        this.user = user;
        this.chatHistory = chatHistory;
    }
}