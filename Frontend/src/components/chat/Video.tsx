import Video_AI_1 from '../../assets/videos/ai_2.mp4';

function VideoComponent() {
  return (
    <div style={{ width: '550px', height: '460px', overflow: 'hidden', margin: '0 auto' }}>
      <video
        src={Video_AI_1}
        muted
        autoPlay
        loop
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    </div>

  );
}

export default VideoComponent;
