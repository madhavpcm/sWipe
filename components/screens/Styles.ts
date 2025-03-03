import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f8f8',
    },
    header: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        zIndex: 2,
    },
    undoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    undoButtonText: {
        color: 'white',
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '500',
    },
    imageContainer: {
        flex: 1,
        width: SCREEN_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mediaContainer: {
        flex: 1,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
      },
    video: {
        width: '100%',
        height: '100%',
    },
    playButton: {
        position: 'absolute',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 30,
        padding: 10,
        zIndex: 2,
    },
    previousImage: {
        position: 'absolute',
        left: -SCREEN_WIDTH, // Position off-screen to the left
    },
    nextImage: {
        position: 'absolute',
        right: -SCREEN_WIDTH, // Position off-screen to the right
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 40,
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingHorizontal: 20,
        zIndex: 2,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        minWidth: 100,
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(10px)',
    },
    deleteButton: {
        backgroundColor: 'rgba(255, 69, 58, 0.6)',
    },
    skipButton: {
        backgroundColor: 'rgba(255, 184, 0, 0.6)',
    },
    keepButton: {
        backgroundColor: 'rgba(48, 209, 88, 0.6)',
    },
    proceedButton: {
        position: 'absolute',
        bottom: 100,
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 122, 255, 0.6)',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        minWidth: 200,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        zIndex: 2,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    counter: {
        position: 'absolute',
        bottom: 150,
        alignSelf: 'center',
        fontSize: 16,
        color: 'white',
        fontWeight: '500',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 12,
        zIndex: 2,
    },
    message: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        padding: 20,
    },
    wrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
      },
      cardContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
      },
      card: {
        borderRadius: 48,
      },
      overlayLabelContainer: {
        width: '100%',
        height: '100%',
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
      },
      overlayLabelText: {
        color: 'white',
        fontSize: 32,
        fontWeight: 'bold',
      },
});
