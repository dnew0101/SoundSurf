import {
    Dropzone,
    DropZoneArea,
    DropzoneDescription,
    DropzoneMessage,
    DropzoneTrigger,
    useDropzone,
} from '@/components/ui/dropzone'

export const AudioUploader = () => {
    const dropzone = useDropzone({
        validation: {
            accept: {
                'audio/*': [],
            },
            maxFiles: 1,
            maxSize: 30 * 1024 * 1024,
        },
        onDropFile: async (file) => ({
            status: 'success',
            result: file,
        }),
    })

    return (
        <Dropzone {...dropzone}>
            <DropZoneArea className="flex min-h-36 w-full flex-col gap-3 border-dashed">
                <DropzoneDescription>
                    Drop an audio file here or choose one manually.
                </DropzoneDescription>
                <DropzoneTrigger>Choose Audio File</DropzoneTrigger>
            </DropZoneArea>
            <DropzoneMessage className="mt-2" />
        </Dropzone>
    )
}