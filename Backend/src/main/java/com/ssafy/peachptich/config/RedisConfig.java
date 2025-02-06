package com.ssafy.peachptich.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * @author : hyomi
 * @fileName : RedisConfig
 * @since : 27/01/25
 */
@Configuration
public class RedisConfig {

    @Value("${spring.data.redis.host}")
    private String host;

    @Value("${spring.data.redis.port}")
    private Integer port;

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        return new LettuceConnectionFactory  (host, port);
    }

    @Bean
    public RedisTemplate<?, ?> redisTemplate() {
        RedisTemplate<?, ?> redisTemplate = new RedisTemplate<>();
        redisTemplate.setConnectionFactory(redisConnectionFactory()); //연결
        redisTemplate.setKeySerializer(new StringRedisSerializer());    // key
        redisTemplate.setValueSerializer(new StringRedisSerializer());  // value
        return redisTemplate;
    }

/** 해야할 것
 * Entity
 * Redis연결 Entity만들고,
 * 해당 Entity에 RedisHash 어노테이션 걸어서 redis 테이블지정해주기.
 * -> RedisHash 내부에 timeToLive = {seconds}기입 시 데이터 만료기간 설정됨. 기본값 = -L
 * @Id가 붙은 필드가 redis의 키값이 됨
 *
 *
 * Controller
 * service불러와서 Redis에 해당 entity 정보 저장
 *
 * @PostMapping("****")
 * public Entity 함수(@RequestBody 객채 객체변수) {
 *     객체 result = service.함수(객체변수);
 *     return result;
 * }
 *
 *Repository
 * public interface UserRedisRepositroy extends CrudRepository<User, String> {
 * }
 *
 *
 */

}
