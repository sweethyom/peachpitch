package com.ssafy.peachptich.global.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.json.JsonMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
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
        LettuceConnectionFactory connectionFactory = new LettuceConnectionFactory(host, port);
        connectionFactory.setDatabase(1); // DB 1 선택
        return connectionFactory;
    }

    @Bean
    public RedisTemplate<String, String> redisTemplate() {
        RedisTemplate<String, String> redisTemplate = new RedisTemplate<>();
        redisTemplate.setConnectionFactory(redisConnectionFactory());
        redisTemplate.setKeySerializer(new StringRedisSerializer());
        redisTemplate.setValueSerializer(new StringRedisSerializer());
        redisTemplate.setHashKeySerializer(new StringRedisSerializer());
        redisTemplate.setHashValueSerializer(new StringRedisSerializer());
        return redisTemplate;
    }

    @Bean
    public RedisTemplate<String, Object> objectRedisTemplate() {
        RedisTemplate<String, Object> objectRedisTemplate = new RedisTemplate<>();
        objectRedisTemplate.setConnectionFactory(redisConnectionFactory());
        objectRedisTemplate.setKeySerializer(new StringRedisSerializer());
        Jackson2JsonRedisSerializer<Object> serializer = new Jackson2JsonRedisSerializer<>(Object.class);
        objectRedisTemplate.setValueSerializer(serializer);
        return objectRedisTemplate;
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
