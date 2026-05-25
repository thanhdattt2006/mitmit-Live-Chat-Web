package com.mitmit.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RedisService {

    private final RedisTemplate<String, Object> redisTemplate;

    public void pushToQueue(String queueName, String value) {
        redisTemplate.opsForList().rightPush(queueName, value);
    }

    public String popFromQueue(String queueName) {
        Object value = redisTemplate.opsForList().leftPop(queueName);
        return value != null ? value.toString() : null;
    }

    public void removeFromQueue(String queueName, String value) {
        redisTemplate.opsForList().remove(queueName, 0, value);
    }

    public void addToSetWithExpire(String key, String value, long timeoutInMinutes) {
        redisTemplate.opsForSet().add(key, value);
        redisTemplate.expire(key, timeoutInMinutes, TimeUnit.MINUTES);
    }

    public boolean isMemberOfSet(String key, String value) {
        Boolean isMember = redisTemplate.opsForSet().isMember(key, value);
        return Boolean.TRUE.equals(isMember);
    }

    public void deleteKey(String key) {
        redisTemplate.delete(key);
    }

    public long getSetSize(String key) {
        Long size = redisTemplate.opsForSet().size(key);
        return size != null ? size : 0;
    }
}
